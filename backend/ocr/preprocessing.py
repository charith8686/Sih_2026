import cv2
import numpy as np

def normalize_image_dimensions(image: np.ndarray, max_dim: int = 1024, min_dim: int = 500) -> tuple[np.ndarray, float]:
    """
    Normalizes image dimensions so that:
    1. Giant 4K/phone images (3000-4000px) are scaled down to 1024px, preventing CPU thrashing.
    2. Tiny thumbnails are scaled up to 500px so text is sharp.
    Returns (scaled_image, scale_factor).
    """
    height, width = image.shape[:2]
    current_max = max(height, width)
    current_min = min(height, width)

    if current_max > max_dim and current_max > 0:
        scale_factor = max_dim / current_max
        new_w = int(round(width * scale_factor))
        new_h = int(round(height * scale_factor))
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        return resized, scale_factor
    elif current_min < min_dim and current_min > 0:
        scale_factor = min_dim / current_min
        scale_factor = min(scale_factor, 2.0)
        new_w = int(round(width * scale_factor))
        new_h = int(round(height * scale_factor))
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        return resized, scale_factor

    return image, 1.0

def apply_clahe_contrast(gray: np.ndarray, clip_limit: float = 2.0, tile_grid_size: tuple[int, int] = (8, 8)) -> np.ndarray:
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    return clahe.apply(gray)

def generate_multi_pass_variants(image: np.ndarray) -> dict[str, np.ndarray]:
    """
    Generates 2 fast candidate image variants:
    1. 'original': Raw normalized input image
    2. 'enhanced': Fast CLAHE contrast enhancement for low-contrast/dark text
    """
    variants = {'original': image}

    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    clahe_gray = apply_clahe_contrast(gray, clip_limit=2.0)
    enhanced_bgr = cv2.cvtColor(clahe_gray, cv2.COLOR_GRAY2BGR)
    variants['enhanced'] = enhanced_bgr

    return variants
