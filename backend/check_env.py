import sys
print(f'Python: {sys.version.split()[0]}')

try:
    import numpy as np
    print(f'NumPy: {np.__version__}')
except Exception as e:
    print(f'NumPy Error: {e}')

try:
    import PIL
    print(f'Pillow: {PIL.__version__}')
except Exception as e:
    print(f'Pillow Error: {e}')

try:
    import cv2
    print(f'OpenCV: {cv2.__version__}')
except Exception as e:
    print(f'OpenCV Error: {e}')

try:
    import torch
    print(f'PyTorch: {torch.__version__}')
except Exception as e:
    print(f'PyTorch Error: {e}')

try:
    import torchvision
    print(f'Torchvision: {torchvision.__version__}')
except Exception as e:
    print(f'Torchvision Error: {e}')

try:
    import easyocr
    print(f'EasyOCR: {easyocr.__version__}')
except Exception as e:
    print(f'EasyOCR Error: {e}')

try:
    import fastapi
    print(f'FastAPI: {fastapi.__version__}')
except Exception as e:
    print(f'FastAPI Error: {e}')

try:
    import uvicorn
    print(f'Uvicorn: {uvicorn.__version__}')
except Exception as e:
    print(f'Uvicorn Error: {e}')
