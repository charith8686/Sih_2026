import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def generate_controlled_synthetic_package(output_path: str):
    """
    Generates a high-resolution 1920x1080 package panel with exact
    Legal Metrology packaged commodity declarations.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 1920, 1080

    # Create background packaging canvas (soft warm off-white container background)
    img = Image.new("RGB", (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)

    # Fonts
    def get_font(size, bold=False):
        font_names = ["segoeui.ttf", "arial.ttf", "tahoma.ttf", "calibri.ttf"]
        if bold:
            font_names = ["segoeuib.ttf", "arialbd.ttf", "tahomabd.ttf", "calibrib.ttf"] + font_names
        for fn in font_names:
            try:
                return ImageFont.truetype(fn, size)
            except Exception:
                continue
        return ImageFont.load_default()

    font_title = get_font(48, bold=True)
    font_brand = get_font(64, bold=True)
    font_sub = get_font(32, bold=True)
    font_body = get_font(28, bold=False)
    font_body_bold = get_font(28, bold=True)
    font_small = get_font(22, bold=False)

    # 1. Outer package border & header banner
    draw.rectangle([40, 40, width - 40, height - 40], outline=(203, 213, 225), width=3)
    draw.rectangle([40, 40, width - 40, 160], fill=(30, 41, 59))
    draw.text((80, 70), "ROYAL HERITAGE FOODS", fill=(255, 255, 255), font=font_brand)

    # 2. Product Name
    draw.text((80, 190), "PREMIUM BASMATI RICE", fill=(15, 23, 42), font=font_title)
    draw.text((80, 255), "Generic Name: Basmati Rice (Aged 2 Years)", fill=(71, 85, 105), font=font_sub)

    # 3. Left Panel - Declarations Container
    draw.rectangle([80, 320, 920, 1000], fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    draw.rectangle([80, 320, 920, 375], fill=(241, 245, 249))
    draw.text((100, 335), "MANDATORY STATUTORY DECLARATIONS", fill=(15, 23, 42), font=font_body_bold)

    y_offset = 395
    line_spacing = 42

    declarations = [
        ("Net Quantity: 500 g", font_body_bold, (15, 23, 42)),
        ("MRP ₹120.00 (incl. of all taxes)", font_body_bold, (185, 28, 28)),
        ("Unit Sale Price: ₹0.24 / g", font_body, (51, 65, 85)),
        ("Month & Year of Mfg: 08/2026", font_body, (51, 65, 85)),
        ("Best Before: 12 Months from Packaging", font_body, (51, 65, 85)),
        ("Batch No: BATCH-AUG26-042", font_body, (51, 65, 85)),
        ("Country of Origin: India", font_body_bold, (15, 23, 42)),
    ]

    for text, font_style, color in declarations:
        draw.text((110, y_offset), text, fill=color, font=font_style)
        y_offset += line_spacing

    y_offset += 15
    draw.line([(100, y_offset), (900, y_offset)], fill=(226, 232, 240), width=2)
    y_offset += 20

    mfg_lines = [
        "Manufactured by: ABC Foods Pvt Ltd",
        "Plot 42, Sector 18, Gurugram, Haryana - 122001",
        "FSSAI Lic. No. 10019022008765"
    ]
    for line in mfg_lines:
        draw.text((110, y_offset), line, fill=(30, 41, 59), font=font_body if "Plot" in line or "FSSAI" in line else font_body_bold)
        y_offset += 38

    y_offset += 10
    draw.line([(100, y_offset), (900, y_offset)], fill=(226, 232, 240), width=2)
    y_offset += 20

    care_lines = [
        "Consumer Care: 1800-123-4567",
        "care@abcfoods.com",
        "Address: Same as manufacturer"
    ]
    for line in care_lines:
        draw.text((110, y_offset), line, fill=(15, 23, 42), font=font_body)
        y_offset += 36

    # 4. Right Panel - Product Highlights, Nutrition & Barcode
    draw.rectangle([960, 320, 1840, 1000], fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    draw.rectangle([960, 320, 1840, 375], fill=(241, 245, 249))
    draw.text((980, 335), "NUTRITIONAL FACTS & DETAILS (Per 100g)", fill=(15, 23, 42), font=font_body_bold)

    nutrition = [
        ("Energy", "350 kcal"),
        ("Protein", "8.5 g"),
        ("Carbohydrate", "78.0 g"),
        ("Total Fat", "0.5 g"),
        ("Dietary Fiber", "2.8 g"),
        ("Cholesterol", "0.0 mg")
    ]
    ny = 395
    for item, val in nutrition:
        draw.text((990, ny), item, fill=(51, 65, 85), font=font_body)
        draw.text((1400, ny), val, fill=(15, 23, 42), font=font_body_bold)
        ny += 42

    # Draw simulated barcode
    bx, by = 990, 720
    draw.rectangle([bx, by, bx + 400, by + 120], fill=(255, 255, 255), outline=(0, 0, 0), width=1)
    bar_x = bx + 20
    np.random.seed(42)
    while bar_x < bx + 380:
        bar_w = np.random.choice([2, 4, 6])
        draw.rectangle([bar_x, by + 10, bar_x + bar_w, by + 90], fill=(0, 0, 0))
        bar_x += bar_w + np.random.choice([2, 4, 6])
    draw.text((bx + 80, by + 95), "8 901234 567890", fill=(0, 0, 0), font=font_small)

    draw.text((990, 880), "Store in a cool, dry and hygienic place.", fill=(71, 85, 105), font=font_body)
    draw.text((990, 925), "100% Vegetarian Product", fill=(22, 101, 52), font=font_body_bold)

    # Save
    img.save(output_path, quality=95)
    print(f"[Controlled Synthetic Test Package] Generated at: {output_path}")

def generate_photorealistic_packaged_photo(output_path: str):
    """
    Generates a realistic commodity product photograph with packaging texture,
    lighting gradient, slight shadows, and Legal Metrology declarations.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    w, h = 1600, 1200

    # Start with realistic wooden/studio table background
    bg = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        # subtle vignette / ambient illumination
        val = int(215 + 25 * np.sin(y / h * np.pi) - 20 * (y / h))
        bg[y, :] = (val, val + 2, val + 4)

    pil_img = Image.fromarray(bg)
    draw = ImageDraw.Draw(pil_img)

    def get_font(size, bold=False):
        font_names = ["segoeui.ttf", "arial.ttf", "calibri.ttf"]
        if bold:
            font_names = ["segoeuib.ttf", "arialbd.ttf", "calibrib.ttf"] + font_names
        for fn in font_names:
            try:
                return ImageFont.truetype(fn, size)
            except Exception:
                continue
        return ImageFont.load_default()

    f_pouch_brand = get_font(52, bold=True)
    f_pouch_title = get_font(42, bold=True)
    f_lbl_bold = get_font(26, bold=True)
    f_lbl = get_font(24, bold=False)
    f_mrp = get_font(30, bold=True)

    # Pouch / Container body (Centered vertical pouch)
    px1, py1, px2, py2 = 250, 100, 1350, 1100
    
    # Shadow
    draw.rectangle([px1 + 15, py1 + 25, px2 + 25, py2 + 25], fill=(160, 160, 160))
    # Pouch background (metallic matte finish)
    draw.rectangle([px1, py1, px2, py2], fill=(245, 245, 240), outline=(180, 180, 175), width=3)
    
    # Pouch top seal
    draw.rectangle([px1, py1, px2, py1 + 60], fill=(220, 220, 215), outline=(170, 170, 165), width=2)
    # Pouch bottom seal
    draw.rectangle([px1, py2 - 60, px2, py2], fill=(220, 220, 215), outline=(170, 170, 165), width=2)

    # Brand header
    draw.rectangle([px1 + 40, py1 + 80, px2 - 40, py1 + 200], fill=(185, 28, 28))
    draw.text((px1 + 80, py1 + 100), "ORGANIC HARVEST", fill=(255, 255, 255), font=f_pouch_brand)
    draw.text((px1 + 80, py1 + 220), "WHOLE WHEAT ATTA", fill=(30, 41, 59), font=f_pouch_title)

    # Declarations Box
    box_x1, box_y1 = px1 + 60, py1 + 300
    box_x2, box_y2 = px2 - 60, py2 - 90
    draw.rectangle([box_x1, box_y1, box_x2, box_y2], fill=(255, 255, 255), outline=(200, 200, 200), width=2)

    # Sticker Banner
    draw.rectangle([box_x1, box_y1, box_x2, box_y1 + 50], fill=(240, 240, 240))
    draw.text((box_x1 + 20, box_y1 + 12), "CONSUMER INFORMATION PANEL", fill=(15, 23, 42), font=f_lbl_bold)

    dy = box_y1 + 70
    items = [
        ("MRP ₹240.00 (incl. of all taxes)", f_mrp, (185, 28, 28)),
        ("Net Quantity: 1 kg", f_lbl_bold, (15, 23, 42)),
        ("Unit Sale Price: ₹0.24 / g", f_lbl, (50, 50, 50)),
        ("Pkd & Mfg Date: 15/08/2026", f_lbl, (50, 50, 50)),
        ("Expiry / Best Before: 6 Months from Packaging", f_lbl, (50, 50, 50)),
        ("Batch No: OH-WHT-9842", f_lbl, (50, 50, 50)),
        ("Country of Origin: India", f_lbl_bold, (15, 23, 42)),
        ("Manufactured by: Pure Naturals Agri Ltd, Sector 5, Haridwar, Uttarakhand - 249403", f_lbl, (30, 30, 30)),
        ("Consumer Care: 1800-889-9900 | help@purenaturals.in", f_lbl, (15, 23, 42))
    ]

    for text, font, col in items:
        draw.text((box_x1 + 30, dy), text, fill=col, font=font)
        dy += 45

    # Add realistic noise/lighting gradient with OpenCV
    img_np = np.array(pil_img)
    # Add subtle gaussian noise for camera sensor simulation
    noise = np.random.normal(0, 3, img_np.shape).astype(np.int16)
    noisy_img = np.clip(img_np.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    cv2.imwrite(output_path, cv2.cvtColor(noisy_img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(f"[Real Package Photograph Test] Generated at: {output_path}")

if __name__ == "__main__":
    assets_dir = os.path.dirname(os.path.abspath(__file__))
    generate_controlled_synthetic_package(os.path.join(assets_dir, "sample_package_synthetic.jpg"))
    generate_photorealistic_packaged_photo(os.path.join(assets_dir, "sample_package_real.jpg"))
