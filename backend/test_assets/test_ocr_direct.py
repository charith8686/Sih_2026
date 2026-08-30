import os
import sys
import time
import cv2

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ocr.engine import run_ocr, generate_annotated_image, get_ocr_reader
from test_assets.generate_test_package import (
    generate_controlled_synthetic_package,
    generate_photorealistic_packaged_photo
)

def run_direct_test(image_path: str):
    image_name = os.path.basename(image_path)
    print("========================================")
    print("EASYOCR DIRECT TEST")
    print("========================================")
    print(f"\nImage:\n{image_name}\n")

    if not os.path.exists(image_path):
        print(f"ERROR: Image file not found at {image_path}")
        print("STATUS: OCR TEST FAILED")
        return False

    # Load image with OpenCV
    img = cv2.imread(image_path)
    if img is None:
        print(f"ERROR: OpenCV failed to decode image at {image_path}")
        print("STATUS: OCR TEST FAILED")
        return False

    h, w = img.shape[:2]
    print(f"Image dimensions:\n{w} x {h}\n")

    print("Initializing EasyOCR...")
    start_init = time.time()
    _ = get_ocr_reader()
    print(f"EasyOCR initialized successfully in {time.time() - start_init:.2f}s.\n")

    print("Running OCR...")
    start_ocr = time.time()
    try:
        detections = run_ocr(img, multi_pass=True, scale_if_small=True)
    except Exception as e:
        print(f"ERROR during OCR execution: {e}")
        print("STATUS: OCR TEST FAILED")
        return False

    ocr_duration = time.time() - start_ocr
    count = len(detections)
    print(f"OCR inference completed in {ocr_duration:.2f}s.")
    print(f"\nDetected regions: {count}\n")

    if count == 0:
        print("WARNING: Zero text regions detected.")
        print("STATUS: OCR TEST FAILED")
        return False

    # Print each detection with details
    total_conf = 0.0
    for idx, det in enumerate(detections, 1):
        total_conf += det["confidence"]
        print("----------------------------------------")
        print(f"{idx}. {det['text']}")
        print(f"Confidence: {det['confidence']:.2f}")
        print(f"Bounding box: {det['bbox']}")
        print(f"Position: {det['position']}")
        print(f"Source pass: {det['source_pass']}")

    print("----------------------------------------")

    avg_conf = (total_conf / count) * 100.0 if count > 0 else 0.0

    # Generate Annotated Image
    outputs_dir = os.path.join(backend_dir, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    annotated_filename = f"annotated_{os.path.splitext(image_name)[0]}.jpg"
    annotated_path = os.path.join(outputs_dir, annotated_filename)

    generate_annotated_image(img, detections, annotated_path)

    print("\n========================================")
    print("OCR TEST SUMMARY")
    print("========================================")
    print(f"\nTotal detections: {count}")
    print(f"Average confidence: {avg_conf:.1f}%\n")
    print(f"Annotated image:\n{annotated_path}\n")
    print("STATUS: OCR PIPELINE WORKING")
    print("========================================\n")
    return True

if __name__ == "__main__":
    assets_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Ensure test images exist
    synth_path = os.path.join(assets_dir, "sample_package_synthetic.jpg")
    real_path = os.path.join(assets_dir, "sample_package_real.jpg")

    if not os.path.exists(synth_path):
        print("[Generator] Generating Test A (Synthetic)...")
        generate_controlled_synthetic_package(synth_path)

    if not os.path.exists(real_path):
        print("[Generator] Generating Test B (Real Photo)...")
        generate_photorealistic_packaged_photo(real_path)

    target_img = sys.argv[1] if len(sys.argv) > 1 else synth_path
    success = run_direct_test(target_img)
    if not success:
        sys.exit(1)
