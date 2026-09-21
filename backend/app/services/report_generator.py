import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.schemas.recommendation import RecommendationResponse

class PDFReportGenerator:
    """
    Generates professional PDF Packaging Engineering Reports using ReportLab.
    """

    @staticmethod
    def generate_recommendation_pdf(data: RecommendationResponse) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom palette styling
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#475569"),
            spaceAfter=12
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        bullet_style = ParagraphStyle(
            "Bullet",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#1e293b"),
            leftIndent=12
        )

        elements = []

        # --- Header ---
        elements.append(Paragraph("AI-BASED FOOD PACKAGING RECOMMENDATION DOSSIER", title_style))
        elements.append(Paragraph(
            f"SIH26236 Intelligent Decision-Support System &bull; Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            subtitle_style
        ))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=10))

        # --- Section 1: Target Food & Conditions Summary ---
        elements.append(Paragraph("1. Target Product & Storage Parameters", section_heading))
        cond_data = [
            [
                Paragraph("<b>Food Product:</b>", body_style),
                Paragraph(data.food_name, body_style),
                Paragraph("<b>Category:</b>", body_style),
                Paragraph(data.category, body_style)
            ],
            [
                Paragraph("<b>Operating Conditions:</b>", body_style),
                Paragraph(data.conditions_summary, body_style),
                Paragraph("<b>Target Shelf Life:</b>", body_style),
                Paragraph(f"{data.target_shelf_life_days} Days", body_style)
            ]
        ]
        cond_table = Table(cond_data, colWidths=[110, 160, 110, 160])
        cond_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(cond_table)
        elements.append(Spacer(1, 10))

        # --- Section 2: Data Provenance ---
        elements.append(Paragraph("2. Data Provenance & Source Transparency", section_heading))
        prov_rows = [["Property", "Tracked Data Source"]]
        for k, v in data.provenance.items():
            clean_k = k.replace("_pct", " (%)").replace("_", " ").title()
            prov_rows.append([clean_k, v])
        
        prov_table = Table(prov_rows, colWidths=[200, 340])
        prov_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0284c7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("PADDING", (0, 0), (-1, -1), 4),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
        ]))
        elements.append(prov_table)
        # --- Section 2b: Explicit Packaging Requirements ---
        if data.packaging_requirements:
            elements.append(Paragraph("2b. Derived Packaging Performance Requirements", section_heading))
            pkg_req = data.packaging_requirements
            req_rows = [
                ["Required Performance Dimension", "Prescribed Level", "Operational Target Range"],
                ["Oxygen Barrier", pkg_req.oxygen_barrier_level, pkg_req.target_otr_range],
                ["Moisture Barrier", pkg_req.moisture_barrier_level, pkg_req.target_wvtr_range],
                ["Seal Integrity", pkg_req.sealability_level, "Hermetic MAP" if data.barrier_requirements.map_required else "Standard Heat Seal"],
                ["Light Shielding", pkg_req.light_barrier_level, "Zero Solar/UV Transmission" if data.barrier_requirements.light_barrier_required else "Transparent Allowed"],
                ["Mechanical Strength", pkg_req.puncture_resistance_level, pkg_req.target_thickness_range]
            ]
            req_table = Table(req_rows, colWidths=[180, 160, 200])
            req_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0fdfa")]),
            ]))
            elements.append(req_table)
            elements.append(Spacer(1, 10))

        # --- Section 3: Primary Engineered Recommendation ---
        elements.append(Paragraph("3. Recommended Packaging Specification (Primary Match)", section_heading))
        rec = data.primary_recommendation
        spec_data = [
            ["Material Specification", rec.name],
            ["Layer Configuration", rec.layer_description],
            ["Engineered Thickness", f"{data.recommended_thickness_um:.1f} µm (Nominal: {rec.thickness_um} µm)"],
            ["Oxygen Barrier (OTR)", f"{rec.otr_cc_m2_day} cc/m²·day·atm (Limit: ≤ {data.barrier_requirements.max_otr_cc_m2_day})"],
            ["Moisture Barrier (WVTR)", f"{rec.wvtr_g_m2_day} g/m²·day (Limit: ≤ {data.barrier_requirements.max_wvtr_g_m2_day})"],
            ["Modified Atmosphere (MAP)", f"{'Yes - Recommended' if rec.map_suitable else 'Not Required'}"],
            ["Estimated Shelf Life", f"{data.estimated_shelf_life_days} Days ({data.shelf_life_status.replace('_', ' ').title()})"],
            ["Commercial Cost Index", f"${rec.cost_per_sqm:.2f} / m²"],
            ["Sustainability & Circularity", f"Score: {rec.sustainability_score}/10 | Recyclability Grade: {rec.recyclability_grade}"]
        ]
        if data.barrier_requirements.recommended_map_gas:
            spec_data.append(["Recommended MAP Gas", data.barrier_requirements.recommended_map_gas])

        spec_table = Table(spec_data, colWidths=[180, 360])
        spec_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e0f2fe")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("PADDING", (0, 0), (-1, -1), 4.5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
        ]))
        elements.append(spec_table)
        elements.append(Spacer(1, 10))

        # --- Section 4: Scientific Rationale (Why This Recommendation?) ---
        elements.append(Paragraph("4. Scientific Rationale & Failure Mode Prevention", section_heading))
        for exp in data.why_explanations:
            elements.append(Paragraph(f"&bull; {exp}", bullet_style))
            elements.append(Spacer(1, 2))

        elements.append(Spacer(1, 6))
        for key, text in data.scientific_deep_dive.items():
            cat_title = key.replace("_", " ").title()
            elements.append(Paragraph(f"<b>{cat_title}:</b> {text}", body_style))
            elements.append(Spacer(1, 4))

        elements.append(Spacer(1, 8))

        # --- Section 5: Viable Alternatives Comparison ---
        if data.alternatives:
            elements.append(Paragraph("5. Viable Material Alternatives & Trade-Offs", section_heading))
            alt_rows = [["Alternative Material", "Est. Life", "Cost/m²", "Recyclability", "Trade-Off Summary"]]
            for alt in data.alternatives:
                alt_rows.append([
                    alt.material.name,
                    f"{alt.estimated_shelf_life_days}d",
                    f"${alt.material.cost_per_sqm:.2f}",
                    alt.material.recyclability_grade,
                    Paragraph(alt.trade_off_summary, ParagraphStyle("Small", fontName="Helvetica", fontSize=7.5, leading=9))
                ])
            alt_table = Table(alt_rows, colWidths=[110, 45, 55, 65, 265])
            alt_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#334155")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ]))
            elements.append(alt_table)

        # Build document
        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_report_generator = PDFReportGenerator()
