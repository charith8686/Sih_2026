import os
import sys
import time
import cv2

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ocr.engine import run_ocr, generate_annotated_image

def test_ocr_regression():
    print("==================================================")
    print("OCR REGRESSION TEST: Verifying EasyOCR Pipeline")
    print("==================================================")

    test_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_package_synthetic.jpg")
    if not os.path.exists(test_image_path):
        print(f"FAIL: Test image not found at {test_image_path}")
        sys.exit(1)

    img = cv2.imread(test_image_path)
    if img is None:
        print("FAIL: Could not decode test image with OpenCV")
        sys.exit(1)

    print(f"Loaded test image: {test_image_path} ({img.shape[1]}x{img.shape[0]})")
    t0 = time.time()
    detections = run_ocr(img, multi_pass=False, scale_if_small=True)
    duration = time.time() - t0

    print(f"Inference completed in {duration:.2f}s")
    print(f"Total detections: {len(detections)}")

    if len(detections) < 10:
        print(f"FAIL: Expected at least 10 detections, got {len(detections)}")
        sys.exit(1)

    # Check key text elements
    all_text = " ".join(d["text"].lower() for d in detections)
    required_keywords = ["basmati", "quantity", "mrp", "origin"]
    missing = [kw for kw in required_keywords if kw not in all_text]

    if missing:
        print(f"FAIL: Missing expected keywords in OCR text: {missing}")
        sys.exit(1)

    # Test annotation generation
    output_annotated_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "outputs", "regression_annotated.jpg")
    annotated_res = generate_annotated_image(img, detections, output_annotated_path)
    if not os.path.exists(output_annotated_path):
        print("FAIL: Annotated image was not generated")
        sys.exit(1)

    print(f"Annotated image generated at: {annotated_res}")
    print("==================================================")
    print("OCR REGRESSION TEST: PASS (100% WORKING)")
    print("==================================================")

if __name__ == "__main__":
    test_ocr_regression()
