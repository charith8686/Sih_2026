# Legal Metrology Packaged-Commodity Real OCR Pipeline

This project implements a **Real EasyOCR Pipeline** with **OpenCV Multi-Pass Preprocessing** to extract mandatory Legal Metrology statutory declarations from packaged commodity photographs.

---

## Verified Architecture

`	ext
Product Image Photograph
        ↓
FastAPI Backend (POST /api/ocr)
        ↓
OpenCV Multi-Pass Preprocessing:
  • Dynamic High-Res Upscaling
  • Grayscale Conversion
  • CLAHE Contrast Enhancement
  • Bilateral Edge-Preserving Denoising
  • Unsharp Mask Sharpening
        ↓
EasyOCR Deep Learning Engine (Singleton Reader, CPU inference)
        ↓
Spatial IoU & Text-Matching Deduplication
        ↓
9-Quadrant Relative Position Calculation
        ↓
High-Resolution Bounding Box & Label Annotation
        ↓
React + Vite UI Display & JSON Debug Inspection
`

---

## Prerequisites & Dependencies

* Python 3.12 / 3.14 (64-bit)
* Node.js v20+ and npm
* PyTorch & Torchvision
* EasyOCR (English ['en'], gpu=False)
* OpenCV (opencv-python)
* NumPy & Pillow
* FastAPI & Uvicorn

---

## Running the Backend

`powershell
cd backend
# Run direct CLI test against synthetic & real packages:
python test_assets/test_ocr_direct.py

# Start FastAPI server on port 8000:
python main.py
# (or: uvicorn main:app --reload --port 8000)
`

Backend API will be accessible at http://localhost:8000.

---

## Running the Frontend

`powershell
cd frontend
npm install
npm run dev
`

Open http://localhost:5173 in your browser.

---

## Adding Real Product Photographs for OCR Testing (Test B)

To test an actual photograph of a packaged commodity (e.g. food box, oil pouch, cosmetic bottle, spice container):

1. Take or copy a clear photograph of the product label into:
   ```text
   backend/test_assets/your_product.jpg
   ```
2. Run the direct OCR diagnostic CLI:
   ```powershell
   python backend/test_assets/test_ocr_direct.py backend/test_assets/your_product.jpg
   ```
3. Or upload the image in the web UI at `http://localhost:5173` to view bounding boxes and structured results.

---

## 🌐 LAN Demonstration Setup (Cross-Device Demonstration over Wi-Fi)

To demonstrate the Legal Metrology system across devices on the same Wi-Fi / Local Area Network (LAN):

### 1. Check your Host Machine's LAN IP Address
On Windows PowerShell:
```powershell
ipconfig
```
Look for `IPv4 Address` under your active Wi-Fi adapter (e.g., `10.136.99.65` or `192.168.1.50`).

### 2. Configure `frontend/.env`
Create or edit `frontend/.env`:
```env
VITE_API_URL=http://<HOST-LAN-IP>:8000
```
*(Example: `VITE_API_URL=http://10.136.99.65:8000`)*

### 3. Start Backend on All Network Interfaces
```powershell
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start Frontend on All Network Interfaces
```powershell
cd frontend
npm run dev -- --host 0.0.0.0
```

### 5. Access from Any Mobile, Tablet, or Laptop on the Same Wi-Fi
Open your browser on the remote device and navigate to:
```
http://<HOST-LAN-IP>:5173
```
*(Example: `http://10.136.99.65:5173`)*

---

## 🔑 Demo Access Credentials

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Public Consumer** | `user@demo.com` | `User@123` |
| **Legal Metrology Officer** | `officer@lm.gov.in` | `Officer@123` |
| **Manufacturer / Packer** | `manufacturer@abcfoods.com` | `Manufacturer@123` |

