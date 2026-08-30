import os
import cv2
import torch
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import easyocr
from .preprocessing import normalize_image_dimensions, generate_multi_pass_variants

# Configure multi-threading for CPU
num_cores = os.cpu_count() or 4
torch.set_num_threads(num_cores)

# Initialize EasyOCR reader with quantization for 3x faster CPU execution
print("[EasyOCR] Initializing quantized reader (languages: ['en'], gpu=False, quantize=True)...")
_reader = easyocr.Reader(['en'], gpu=False, quantize=True)
print("[EasyOCR] Reader initialized successfully.")

def get_ocr_reader() -> easyocr.Reader:
    return _reader

def calculate_relative_position(bbox: list[list[int]], img_width: int, img_height: int) -> str:
    if img_width <= 0 or img_height <= 0 or not bbox:
        return "Center"

    cx = sum(pt[0] for pt in bbox) / len(bbox)
    cy = sum(pt[1] for pt in bbox) / len(bbox)

    rel_x = cx / img_width
    rel_y = cy / img_height

    if rel_y < 0.35:
        v_pos = "Top"
    elif rel_y > 0.65:
        v_pos = "Bottom"
    else:
        v_pos = "Center"

    if rel_x < 0.35:
        h_pos = "Left"
    elif rel_x > 0.65:
        h_pos = "Right"
    else:
        h_pos = "Center"

    if v_pos == "Center" and h_pos == "Center":
        return "Center"
    elif v_pos == "Center":
        return f"Center {h_pos}"
    elif h_pos == "Center":
        return f"{v_pos} Center"
    else:
        return f"{v_pos} {h_pos}"

def compute_box_iou(box1: list[list[int]], box2: list[list[int]]) -> float:
    try:
        x1_min = min(pt[0] for pt in box1)
        y1_min = min(pt[1] for pt in box1)
        x1_max = max(pt[0] for pt in box1)
        y1_max = max(pt[1] for pt in box1)

        x2_min = min(pt[0] for pt in box2)
        y2_min = min(pt[1] for pt in box2)
        x2_max = max(pt[0] for pt in box2)
        y2_max = max(pt[1] for pt in box2)

        inter_xmin = max(x1_min, x2_min)
        inter_ymin = max(y1_min, y2_min)
        inter_xmax = min(x1_max, x2_max)
        inter_ymax = min(y1_max, y2_max)

        if inter_xmax <= inter_xmin or inter_ymax <= inter_ymin:
            return 0.0

        inter_area = (inter_xmax - inter_xmin) * (inter_ymax - inter_ymin)
        box1_area = (x1_max - x1_min) * (y1_max - y1_min)
        box2_area = (x2_max - x2_min) * (y2_max - y2_min)

        union_area = box1_area + box2_area - inter_area
        if union_area <= 0:
            return 0.0

        return inter_area / union_area
    except Exception:
        return 0.0

def text_similarity(s1: str, s2: str) -> float:
    s1_clean = "".join(c.lower() for c in s1 if c.isalnum())
    s2_clean = "".join(c.lower() for c in s2 if c.isalnum())
    if not s1_clean or not s2_clean:
        return 0.0
    if s1_clean == s2_clean:
        return 1.0
    if s1_clean in s2_clean or s2_clean in s1_clean:
        return min(len(s1_clean), len(s2_clean)) / max(len(s1_clean), len(s2_clean))
    
    common = sum((min(s1_clean.count(c), s2_clean.count(c))) for c in set(s1_clean))
    return (2.0 * common) / (len(s1_clean) + len(s2_clean))

def deduplicate_detections(detections: list[dict], iou_thresh: float = 0.45) -> list[dict]:
    if not detections:
        return []

    sorted_dets = sorted(detections, key=lambda d: d["confidence"], reverse=True)
    merged: list[dict] = []

    for cand in sorted_dets:
        duplicate_found = False
        for m in merged:
            iou = compute_box_iou(cand["bbox"], m["bbox"])
            sim = text_similarity(cand["text"], m["text"])
            
            if iou > 0.65 or (iou > iou_thresh and sim > 0.4):
                duplicate_found = True
                break
        
        if not duplicate_found:
            merged.append(cand)

    merged.sort(key=lambda d: (min(pt[1] for pt in d["bbox"]), min(pt[0] for pt in d["bbox"])))
    return merged

def run_ocr(
    image: np.ndarray,
    multi_pass: bool = False,
    scale_if_small: bool = True
) -> list[dict]:
    """
    High-performance EasyOCR inference:
    - Normalizes image size to prevent CPU thrashing on 4K/high-res photos.
    - Uses canvas_size=800, batch_size=128, mag_ratio=1.0 for ~5-9s CPU execution.
    """
    orig_h, orig_w = image.shape[:2]
    
    # 1. Normalize dimensions
    scaled_img, scale_factor = normalize_image_dimensions(image, max_dim=1024, min_dim=500)

    # 2. Variants
    if multi_pass:
        variants = generate_multi_pass_variants(scaled_img)
    else:
        variants = {'original': scaled_img}

    all_raw_detections: list[dict] = []

    for pass_name, variant_img in variants.items():
        try:
            results = _reader.readtext(
                variant_img,
                batch_size=128,
                canvas_size=800,
                mag_ratio=1.0,
                workers=0
            )
            for (raw_bbox, text, conf) in results:
                cleaned_text = text.strip()
                if not cleaned_text:
                    continue

                orig_bbox = [
                    [int(round(pt[0] / scale_factor)), int(round(pt[1] / scale_factor))]
                    for pt in raw_bbox
                ]

                clipped_bbox = [
                    [max(0, min(orig_w - 1, pt[0])), max(0, min(orig_h - 1, pt[1]))]
                    for pt in orig_bbox
                ]

                pos = calculate_relative_position(clipped_bbox, orig_w, orig_h)

                all_raw_detections.append({
                    "text": cleaned_text,
                    "confidence": round(float(conf), 4),
                    "bbox": clipped_bbox,
                    "position": pos,
                    "source_pass": pass_name
                })
        except Exception as e:
            print(f"[EasyOCR] Warning in pass '{pass_name}': {e}")

    final_detections = deduplicate_detections(all_raw_detections)
    return final_detections

def generate_annotated_image(
    image: np.ndarray,
    detections: list[dict],
    output_path: str
) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    h, w = image.shape[:2]

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb_image)
    draw = ImageDraw.Draw(pil_img, "RGBA")

    font_size = max(14, int(min(w, h) * 0.022))
    font = None
    for font_name in ["arial.ttf", "segoeui.ttf", "tahoma.ttf", "calibri.ttf", "DejaVuSans.ttf"]:
        try:
            font = ImageFont.truetype(font_name, font_size)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    colors = [
        (34, 197, 94),   # Green
        (59, 130, 246),  # Blue
        (234, 88, 12),   # Orange
        (168, 85, 247),  # Purple
        (236, 72, 153),  # Pink
        (20, 184, 166),  # Teal
    ]

    for idx, det in enumerate(detections):
        bbox = det["bbox"]
        text = det["text"]
        conf = det["confidence"]
        box_color = colors[idx % len(colors)]

        poly_pts = [(pt[0], pt[1]) for pt in bbox]
        draw.polygon(poly_pts, outline=(*box_color, 255), width=3)
        draw.polygon(poly_pts, fill=(*box_color, 35))

        label_text = f"{text} ({int(conf * 100)}%)"

        text_bbox = draw.textbbox((0, 0), label_text, font=font)
        tw = text_bbox[2] - text_bbox[0]
        th = text_bbox[3] - text_bbox[1]

        min_x = min(pt[0] for pt in bbox)
        min_y = min(pt[1] for pt in bbox)
        max_y = max(pt[1] for pt in bbox)

        padding = 4
        if min_y - (th + 2 * padding) >= 0:
            lbl_x1 = max(0, min_x)
            lbl_y1 = min_y - (th + 2 * padding)
        else:
            lbl_x1 = max(0, min_x)
            lbl_y1 = min(h - (th + 2 * padding), max_y + 2)

        lbl_x2 = min(w, lbl_x1 + tw + 2 * padding)
        lbl_y2 = lbl_y1 + th + 2 * padding

        draw.rectangle([lbl_x1, lbl_y1, lbl_x2, lbl_y2], fill=(15, 23, 42, 230))
        draw.text((lbl_x1 + padding, lbl_y1 + padding), label_text, fill=(255, 255, 255, 255), font=font)

    annotated_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    cv2.imwrite(output_path, annotated_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return output_path
