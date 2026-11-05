"""Generate the downloadable business documents in public/downloads.

Requires: reportlab, openpyxl  (pip install reportlab openpyxl)
Run:      npm run generate:documents
"""
import csv
import json
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "downloads"
(OUT / "private").mkdir(parents=True, exist_ok=True)
products = json.loads((ROOT / "src" / "data" / "products.json").read_text(encoding="utf-8"))
visible = [p for p in products if not p.get("hidden")]
hidden = [p for p in products if p.get("hidden")]
stores = json.loads((ROOT / "src" / "data" / "stores.json").read_text(encoding="utf-8"))

GOLD = colors.HexColor("#b08636")
COCOA = colors.HexColor("#553f2a")
CREAM = colors.HexColor("#fdf8ee")
CREAM2 = colors.HexColor("#f1e3c6")

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Title"], fontName="Times-Bold", fontSize=26, textColor=COCOA, spaceAfter=6)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontName="Times-Bold", fontSize=16, textColor=GOLD, spaceBefore=10, spaceAfter=6)
BODY = ParagraphStyle("B", parent=ss["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=COCOA)
SMALL = ParagraphStyle("S", parent=BODY, fontSize=8, leading=10, textColor=colors.HexColor("#8b6a48"))
CENTER = ParagraphStyle("C", parent=BODY, alignment=TA_CENTER)


def inr(n):
    s = str(int(round(n)))
    if len(s) <= 3:
        return "Rs. " + s
    last3, rest = s[-3:], s[:-3]
    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.insert(0, rest)
    return "Rs. " + ",".join(parts) + "," + last3


def decorate(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.6)
    canvas.rect(10 * mm, 10 * mm, A4[0] - 20 * mm, A4[1] - 20 * mm)
    canvas.setFont("Times-Roman", 8)
    canvas.setFillColor(colors.HexColor("#a8865f"))
    canvas.drawString(15 * mm, 13 * mm, "MODERN JEWELLERS PVT. LTD. · 14 Rampart Row, Kala Ghoda, Mumbai 400001 · Fictional demo business")
    canvas.drawRightString(A4[0] - 15 * mm, 13 * mm, f"Page {doc.page}")
    canvas.restoreState()


def table(rows, widths, header=True, font=8):
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("FONT", (0, 0), (-1, -1), "Helvetica", font),
        ("TEXTCOLOR", (0, 0), (-1, -1), COCOA),
        ("GRID", (0, 0), (-1, -1), 0.3, CREAM2),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fbf4e6")]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), GOLD), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", font)]
    t.setStyle(TableStyle(style))
    return t


def build(path, story, title):
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=20 * mm, bottomMargin=20 * mm,
                            title=title, author="Modern Jewellers", subject=title)
    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)


def cover(title, subtitle):
    return [Spacer(1, 50 * mm), Paragraph("MODERN JEWELLERS", ParagraphStyle("brand", parent=H1, fontSize=34, alignment=TA_CENTER, textColor=GOLD)),
            Paragraph("SINCE 1987 · MUMBAI", ParagraphStyle("since", parent=CENTER, fontSize=9, textColor=COCOA)), Spacer(1, 18 * mm),
            Paragraph(title, ParagraphStyle("ct", parent=H1, alignment=TA_CENTER)), Paragraph(subtitle, CENTER), Spacer(1, 10 * mm),
            Paragraph(f"Issued {date(2026, 11, 5).strftime('%d %B %Y')}", CENTER), PageBreak()]


# 1. Catalogue ----------------------------------------------------------------
story = cover("Product Catalogue 2026", "Gold · Diamond · Silver · Bridal")
cats = []
for p in visible:
    if p["category"] not in cats:
        cats.append(p["category"])
for c in cats:
    story.append(Paragraph(c, H2))
    rows = [["ID", "Product", "Material", "Weight", "Price", "Availability"]]
    for p in [x for x in visible if x["category"] == c]:
        rows.append([p["id"], Paragraph(p["name"], BODY), Paragraph(p["material"], SMALL), p["weight"], inr(p["price"]), p["availability"]])
    story.append(table(rows, [24 * mm, 44 * mm, 52 * mm, 17 * mm, 22 * mm, 22 * mm]))
    story.append(Spacer(1, 4 * mm))
story.append(Paragraph("All gold jewellery is BIS hallmarked with HUID. Diamond jewellery is IGI/SGL certified. Prices inclusive of GST, valid till 30 Nov 2026.", SMALL))
build(OUT / "Modern_Jewellers_Catalogue.pdf", story, "Modern Jewellers Catalogue 2026")

# 2. Company profile ------------------------------------------------------------
story = cover("Company Profile", "Thirty-nine years of trust, crafted by hand")
story += [
    Paragraph("About Us", H2),
    Paragraph("Modern Jewellers Pvt. Ltd. was founded in 1987 by Shri Harish Mehta as a single kundan workshop in Zaveri Bazaar, Mumbai. "
              "Today the company operates eight flagship stores, an online boutique delivering to 19,000+ PIN codes, and two ateliers "
              "employing more than 120 master karigars.", BODY),
    Paragraph("Key Facts", H2),
    table([["Metric", "Value"], ["Founded", "1987, Mumbai"], ["Stores", "8 flagships across India"], ["Karigars", "120+"], ["Families served", "2.4 lakh+"],
           ["FY2025-26 revenue", "Rs. 94.6 Crore (fictional)"], ["Certifications", "BIS Hallmark, IGI, SGL, ISO 9001:2015"], ["Headquarters", "Kala Ghoda, Mumbai"]],
          [60 * mm, 110 * mm]),
    Paragraph("Leadership", H2),
    table([["Name", "Designation"], ["Harish Mehta", "Founder & Chairman"], ["Radhika Mehta", "Managing Director"], ["Sameer Kothari", "Chief Financial Officer"],
           ["Nandini Rao", "Head of Design"], ["Arvind Soni", "Master Karigar, Jaipur Atelier"], ["Leela Fernandes", "Head of Operations"]], [60 * mm, 110 * mm]),
    Paragraph("Store Network", H2),
    table([["City", "Store", "Phone", "Services"]] + [[s["city"], Paragraph(s["address"], SMALL), s["phone"], Paragraph(", ".join(s["services"]), SMALL)] for s in stores],
          [24 * mm, 70 * mm, 32 * mm, 50 * mm]),
    Paragraph("Our Promise", H2),
    Paragraph("Purity · Provenance · Patience · People. 15-day returns, lifetime exchange, free annual cleaning and insured delivery on every order.", BODY),
]
build(OUT / "Company_Profile.pdf", story, "Modern Jewellers Company Profile")

# 3. Product details -------------------------------------------------------------
story = cover("Product Details & Specifications", "Technical specification sheets")
for i, p in enumerate(visible):
    story.append(Paragraph(f"{p['name']}  <font size=9 color='#a8865f'>({p['id']})</font>", H2))
    story.append(Paragraph(p["description"].replace("[[", "").replace("]]", ""), BODY))
    rows = [["Specification", "Detail"], ["Category", p["category"]], ["Material", p["material"]], ["Price", inr(p["price"])], ["MRP", inr(p["mrp"])],
            ["Stock", str(p["stock"])], ["Rating", f"{p['rating']} / 5 ({p['reviewsCount']} reviews)"]]
    rows += [[k, v] for k, v in p["specifications"].items()]
    story.append(table(rows, [50 * mm, 120 * mm], font=7.5))
    if i % 2 == 1:
        story.append(PageBreak())
build(OUT / "Product_Details.pdf", story, "Modern Jewellers Product Details")

# 4. Inventory CSV ---------------------------------------------------------------
cities = [s["city"] for s in stores]
with open(OUT / "Inventory_Report.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["Product ID", "Product Name", "Category", "Metal", "Purity", "Weight (g)", "Unit Price (INR)", "Online Stock"] + [f"{c} Store" for c in cities]
               + ["Total Units", "Stock Value (INR)", "Status", "Reorder Level", "Last Audit"])
    for idx, p in enumerate(visible):
        store_units = [((idx * 7 + j * 3) % 5) for j in range(len(cities))]
        total = p["stock"] + sum(store_units)
        status = "Out of Stock" if p["stock"] == 0 else "Low" if p["stock"] <= 3 else "Healthy"
        w.writerow([p["id"], p["name"], p["category"], p["metalGroup"], p["purity"], p["weightGrams"], p["price"], p["stock"]] + store_units
                   + [total, total * p["price"], status, 3 if p["price"] > 100000 else 8, "2026-10-31"])

# 5. Price list XLSX ---------------------------------------------------------------
wb = Workbook()
ws = wb.active
ws.title = "Price List"
head_fill = PatternFill("solid", fgColor="B08636")
thin = Side(style="thin", color="F1E3C6")
ws.append(["MODERN JEWELLERS — PRICE LIST (valid 01–30 Nov 2026)"])
ws.merge_cells("A1:K1")
ws["A1"].font = Font(name="Georgia", size=14, bold=True, color="553F2A")
ws.append(["Gold rate (22K): Rs. 7,215/g · Gold rate (18K): Rs. 5,905/g · Silver (925): Rs. 96/g — fictional rates"])
ws.merge_cells("A2:K2")
ws["A2"].font = Font(italic=True, color="8B6A48")
headers = ["Product ID", "Product Name", "Category", "Metal", "Material", "Purity", "Weight (g)", "MRP (INR)", "Offer Price (INR)", "Discount %", "Availability"]
ws.append(headers)
for c in ws[3]:
    c.font = Font(bold=True, color="FFFFFF")
    c.fill = head_fill
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
for p in visible:
    ws.append([p["id"], p["name"], p["category"], p["metalGroup"], p["material"], p["purity"], p["weightGrams"], p["mrp"], p["price"], p["discountPercent"] / 100, p["availability"]])
for row in ws.iter_rows(min_row=4):
    for c in row:
        c.border = Border(top=thin, bottom=thin, left=thin, right=thin)
    row[7].number_format = row[8].number_format = '"₹"#,##,##0'
    row[9].number_format = "0%"
last = ws.max_row
ws.append([])
ws.append(["", "Total catalogue value (offer price)", "", "", "", "", "", "", f"=SUM(I4:I{last})"])
ws.cell(ws.max_row, 9).number_format = '"₹"#,##,##0'
ws.cell(ws.max_row, 2).font = Font(bold=True)
for col, width in zip("ABCDEFGHIJK", [13, 36, 13, 10, 40, 12, 11, 14, 16, 11, 16]):
    ws.column_dimensions[col].width = width
ws.freeze_panes = "A4"

ws2 = wb.create_sheet("Making Charges")
ws2.append(["Category", "Making Charges", "Wastage", "Notes"])
for r in [["Rings", "12%", "2%", "Resizing free within 30 days"], ["Necklaces", "14%", "3%", "Temple & kundan: 18%"], ["Earrings", "12%", "2%", ""],
          ["Bracelets", "12%", "2%", ""], ["Bangles", "10%", "2%", "Antique finish +2%"], ["Mangalsutra", "10%", "1%", ""],
          ["Bridal Sets", "18%", "4%", "Includes custom fitting"], ["Accessories", "12%", "2%", ""], ["Silver (all)", "Included", "—", "Flat pricing"]]:
    ws2.append(r)
ws3 = wb.create_sheet("Coupons")
ws3.append(["Code", "Benefit", "Minimum Order (INR)", "Valid Till"])
for r in [["WELCOME10", "10% off first order", 0, "31-Dec-2026"], ["FESTIVE15", "15% off", 50000, "30-Nov-2026"], ["SHAADI25K", "Rs. 25,000 off", 300000, "31-Mar-2027"], ["SILVER500", "Rs. 500 off", 4000, "31-Dec-2026"]]:
    ws3.append(r)
for sheet in (ws2, ws3):
    for c in sheet[1]:
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = head_fill
    for col in "ABCD":
        sheet.column_dimensions[col].width = 24
wb.properties.creator = "Modern Jewellers"
wb.save(OUT / "Modern_Jewellers_Price_List.xlsx")

# 6. Hidden document: vault ledger -------------------------------------------------
story = cover("The Vault Ledger — Q4 2026", "Private · For senior management and Gold Room patrons")
story += [
    Paragraph("Unlisted Vault Pieces", H2),
    table([["Code", "Piece", "Material", "Weight", "Value"]] + [[p["id"], Paragraph(p["name"], BODY), Paragraph(p["material"], SMALL), p["weight"], inr(p["price"])] for p in hidden],
          [24 * mm, 48 * mm, 56 * mm, 18 * mm, 28 * mm]),
    Paragraph("Search note: the Noor-e-Kohinoor choker surfaces in the online boutique only when a patron searches for the word “kohinoor”. "
              "The other vault pieces respond only to their exact reference code.", BODY),
    Paragraph("Private Viewing Schedule", H2),
    table([["Date", "Store", "Patron", "Pieces"], ["14 Nov 2026", "Kala Ghoda, Mumbai", "The Kapoor family", "MJ-VX-9001, MJ-BS-7001"],
           ["22 Nov 2026", "Banjara Hills, Hyderabad", "Mrs. F. Sheikh", "MJ-VX-9002"], ["03 Dec 2026", "C-Scheme, Jaipur", "Private collector (NDA)", "MJ-VX-9003"]],
          [28 * mm, 50 * mm, 48 * mm, 48 * mm]),
    Paragraph("Management Access Notes", H2),
    Paragraph("The online Confidential Management Document is protected by the founder’s key: <b>Kundan@1987</b>. "
              "Patron privilege coupon: <b>GOLDROOM25</b> (25%). Do not circulate outside the management team.", BODY),
    Spacer(1, 8 * mm),
    Paragraph("— Leela Fernandes, Head of Operations · Fictional document for demonstration purposes", SMALL),
]
build(OUT / "private" / "MJ_Vault_Ledger_Q4_2026.pdf", story, "MJ Vault Ledger Q4 2026")

print("Documents written to", OUT)
for f in sorted(OUT.rglob("*.*")):
    print(" -", f.relative_to(OUT), f.stat().st_size, "bytes")
