import sys
import os
import platform
import gc

from pdf2image import convert_from_path, pdfinfo_from_path
import pytesseract

# -------------------------------------------------------
# Configure Tesseract & Poppler
# -------------------------------------------------------

if platform.system() == "Windows":
    os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

    POPPLER_PATH = r"C:\poppler\Library\bin"

else:
    # Linux (Docker / Render)
    pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
    POPPLER_PATH = None


# -------------------------------------------------------
# OCR Function
# -------------------------------------------------------

def extract_text(pdf_path):

    print("========== OCR START ==========", file=sys.stderr, flush=True)
    print(f"Platform : {platform.system()}", file=sys.stderr, flush=True)
    print(f"Tesseract: {pytesseract.pytesseract.tesseract_cmd}", file=sys.stderr, flush=True)
    print(f"TESSDATA : {os.environ.get('TESSDATA_PREFIX')}", file=sys.stderr, flush=True)

    # Get PDF information WITHOUT loading every page
    if POPPLER_PATH:
        info = pdfinfo_from_path(
            pdf_path,
            poppler_path=POPPLER_PATH
        )
    else:
        info = pdfinfo_from_path(pdf_path)

    total_pages = info["Pages"]

    print(f"Total Pages: {total_pages}", file=sys.stderr, flush=True)

    full_text = ""

    # Process ONE page at a time
    for page_number in range(1, total_pages + 1):

        print(
            f"Reading Page {page_number}/{total_pages}",
            file=sys.stderr,
            flush=True
        )

        if POPPLER_PATH:
            pages = convert_from_path(
                pdf_path,
                dpi=150,
                first_page=page_number,
                last_page=page_number,
                poppler_path=POPPLER_PATH,
            )
        else:
            pages = convert_from_path(
                pdf_path,
                dpi=150,
                first_page=page_number,
                last_page=page_number,
            )

        page = pages[0]

        text = pytesseract.image_to_string(
            page,
            lang="eng",
        )

        full_text += text + "\n"

        print(
            f"Finished Page {page_number}",
            file=sys.stderr,
            flush=True
        )

        # Release memory immediately
        del page
        del pages
        gc.collect()

    print("========== OCR COMPLETE ==========", file=sys.stderr, flush=True)

    return full_text


# -------------------------------------------------------
# Main
# -------------------------------------------------------

if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage: python extract_text.py <pdf_path>", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]

    if not os.path.exists(pdf_path):
        print("PDF not found", file=sys.stderr)
        sys.exit(1)

    try:
        extracted = extract_text(pdf_path)

        sys.stdout.buffer.write(
            extracted.encode("utf-8", errors="replace")
        )

        sys.exit(0)

    except Exception as e:
        print(f"OCR Error: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)