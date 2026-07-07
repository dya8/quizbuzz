import sys
import os
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"
from pdf2image import convert_from_path
import pytesseract
import platform
# ----------------------------
# Tesseract Installation Path
# ----------------------------
#pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ----------------------------
# Poppler Path
# Change this if yours is different
# Example:
# C:\poppler\Library\bin
# ----------------------------
if platform.system() == "Windows":
    POPPLER_PATH = r"C:\poppler\Library\bin"
    pytesseract.pytesseract.tesseract_cmd = \
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    
else:
    POPPLER_PATH = None

def extract_text(pdf_path):

    print("Starting OCR...", file=sys.stderr, flush=True)

    if POPPLER_PATH:
        pages = convert_from_path(
        pdf_path,
        dpi=300,
        poppler_path=POPPLER_PATH
    )
    else:
        pages = convert_from_path(
        pdf_path,
        dpi=300
    )

    print(f"Total Pages: {len(pages)}", file=sys.stderr, flush=True)

    full_text = ""

    for i, page in enumerate(pages):

        print(f"Reading Page {i+1}", file=sys.stderr, flush=True)

        text = pytesseract.image_to_string(
            page,
            lang="eng"
        )

        print(f"Finished Page {i+1}", file=sys.stderr, flush=True)

        full_text += text + "\n"

    print("OCR Complete", file=sys.stderr, flush=True)

    return full_text


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage: python extract_text.py <pdf_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]

    if not os.path.exists(pdf_path):
        print("PDF not found")
        sys.exit(1)

    extracted = extract_text(pdf_path)

    sys.stdout.buffer.write(extracted.encode("utf-8", errors="replace"))