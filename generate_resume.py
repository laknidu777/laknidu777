import json
import os
import sys
import argparse
from fpdf import FPDF

class ATSResumePDF(FPDF):
    def __init__(self, use_system_fonts=True):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(12, 7.5, 12)  # 12mm left/right, 7.5mm top/bottom
        self.set_auto_page_break(auto=True, margin=6.5)
        
        # Load Arial system font if available for full Unicode support
        self.font_name = "Helvetica"
        if use_system_fonts:
            try:
                # Windows fonts path
                arial_regular = "C:/Windows/Fonts/arial.ttf"
                arial_bold = "C:/Windows/Fonts/arialbd.ttf"
                arial_italic = "C:/Windows/Fonts/ariali.ttf"
                if os.path.exists(arial_regular):
                    self.add_font("Arial", "", arial_regular)
                    if os.path.exists(arial_bold):
                        self.add_font("Arial", "B", arial_bold)
                    if os.path.exists(arial_italic):
                        self.add_font("Arial", "I", arial_italic)
                    self.font_name = "Arial"
            except Exception as e:
                print(f"System fonts load failed: {e}. Falling back to core Helvetica.", file=sys.stderr)
                self.font_name = "Helvetica"

    def clean_text(self, text):
        """Sanitize text to handle characters safely in PDF."""
        if not text:
            return ""
        # Replace common Unicode dashes, bullets, quotes with ASCII equivalents
        replacements = {
            "\u2013": "-",
            "\u2014": "-",
            "\u2022": "-",
            "\u2018": "'",
            "\u2019": "'",
            "\u201c": '"',
            "\u201d": '"',
            "\u2026": "...",
            "\u00a0": " ",
            "•": "-",
        }
        for k, v in replacements.items():
            text = text.replace(k, v)
        return text

    def footer(self):
        self.set_y(-6.5)
        self.set_font(self.font_name, "I", 7.8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 4.5, f"Page {self.page_no()} of {{nb}}", align="C")

    def draw_section_header(self, title):
        self.ln(2.8)
        self.set_font(self.font_name, "B", 10.5)
        self.set_text_color(15, 76, 129)  # Deep blue accent
        self.cell(0, 4.6, self.clean_text(title.upper()), align="L")
        self.ln(4.6)
        # Draw horizontal divider
        y = self.get_y() - 0.4
        self.set_draw_color(180, 180, 180)
        self.set_line_width(0.35)
        self.line(12, y, 198, y)
        self.ln(2.0)

    def draw_header(self, info):
        self.set_y(8.0)
        self.set_font(self.font_name, "B", 18)
        self.set_text_color(33, 33, 33)
        self.cell(0, 7.5, self.clean_text(info.get("name", "").upper()), align="C")
        self.ln(7.5)
        
        self.set_font(self.font_name, "B", 10.2)
        self.set_text_color(15, 76, 129)
        self.cell(0, 4.8, self.clean_text(info.get("title", "").upper()), align="C")
        self.ln(5.0)
        
        email = info.get('email', '')
        phone = info.get('phone', '')
        portfolio = info.get('portfolio', '')
        github = info.get('github', '')
        linkedin = info.get('linkedin', '')

        # Strip prefixes for clean display
        display_portfolio = portfolio.replace('https://', '').replace('http://', '').rstrip('/')
        display_github = github.replace('https://', '').replace('http://', '').rstrip('/')
        display_linkedin = linkedin.replace('https://', '').replace('http://', '').rstrip('/')

        items = [
            (email, f"mailto:{email}") if email else None,
            (phone, f"tel:{phone.replace(' ', '')}") if phone else None,
            (display_portfolio, f"https://{display_portfolio}") if display_portfolio else None,
            (display_github, f"https://{display_github}") if display_github else None,
            (display_linkedin, f"https://{display_linkedin}") if display_linkedin else None,
        ]
        items = [(self.clean_text(txt), url) for txt, url in items if txt]
        
        divider = "   |   "
        self.set_font(self.font_name, "", 8.2)
        
        total_w = sum(self.get_string_width(txt) for txt, _ in items) + self.get_string_width(divider) * (len(items) - 1)
        start_x = max(12, (self.w - total_w) / 2)
        self.set_x(start_x)
        
        for idx, (txt, url) in enumerate(items):
            self.set_text_color(85, 85, 85)
            self.cell(self.get_string_width(txt), 3.9, txt, link=url)
            if idx < len(items) - 1:
                self.set_text_color(150, 150, 150)
                self.cell(self.get_string_width(divider), 3.9, divider)
        self.ln(4.5)

    def draw_summary(self, text):
        if not text:
            return
        self.draw_section_header("Profile Summary")
        self.set_font(self.font_name, "", 9.0)
        self.set_text_color(51, 51, 51)
        self.multi_cell(0, 4.0, self.clean_text(text))
        self.ln(1.2)

    def draw_experience(self, exp_list):
        if not exp_list:
            return
        self.draw_section_header("Work Experience")
        for item in exp_list:
            if self.get_y() > 262:
                self.add_page()
            
            # Role & Duration
            self.set_font(self.font_name, "B", 9.5)
            self.set_text_color(51, 51, 51)
            role_comp = f"{item.get('role', '')} - {item.get('company', '')}"
            self.cell(135, 4.6, self.clean_text(role_comp))
            
            # Duration on right
            self.set_font(self.font_name, "B", 8.8)
            self.set_text_color(102, 102, 102)
            self.cell(0, 4.6, self.clean_text(item.get("duration", "")), align="R")
            self.ln(4.6)
            
            # Bullets
            self.set_font(self.font_name, "", 8.8)
            self.set_text_color(68, 68, 68)
            bullets = item.get("bullets", [])
            for bullet in bullets:
                self.set_x(15)
                self.cell(3.2, 3.9, "-")
                self.multi_cell(0, 3.9, self.clean_text(bullet))
            self.ln(1.6)

    def draw_education(self, edu_list):
        if not edu_list:
            return
        self.draw_section_header("Education")
        for item in edu_list:
            if self.get_y() > 262:
                self.add_page()
                
            self.set_font(self.font_name, "B", 9.4)
            self.set_text_color(51, 51, 51)
            degree_str = item.get("degree", "")
            if item.get("grade"):
                degree_str += f" ({item['grade']})"
            self.cell(135, 4.4, self.clean_text(degree_str))
            
            self.set_font(self.font_name, "B", 8.8)
            self.set_text_color(102, 102, 102)
            self.cell(0, 4.4, self.clean_text(item.get("duration", "")), align="R")
            self.ln(4.4)
            
            self.set_font(self.font_name, "I", 8.6)
            self.set_text_color(88, 88, 88)
            self.cell(0, 3.8, self.clean_text(item.get("institution", "")))
            self.ln(4.0)

    def draw_projects(self, projects_dict):
        if not projects_dict:
            return
        self.draw_section_header("Projects")
        
        categories = [
            ("Work Projects", projects_dict.get("work", [])),
            ("Personal Projects", projects_dict.get("personal", []))
        ]
        
        has_both = bool(projects_dict.get("work")) and bool(projects_dict.get("personal"))

        for cat_name, proj_list in categories:
            if not proj_list:
                continue
                
            if self.get_y() > 260:
                self.add_page()

            if has_both:
                self.set_font(self.font_name, "B", 9.5)
                self.set_text_color(15, 76, 129)
                self.cell(0, 4.3, cat_name)
                self.ln(4.3)
            
            for proj in proj_list:
                # Check for page boundary
                if self.get_y() > 254:
                    self.add_page()
                    
                # Project Name
                self.set_font(self.font_name, "B", 9.1)
                self.set_text_color(51, 51, 51)
                self.cell(0, 4.0, self.clean_text(proj.get("name", "")))
                self.ln(4.0)
                
                # Tech Stack (Italic, colored)
                self.set_font(self.font_name, "I", 8.0)
                self.set_text_color(102, 102, 102)
                techs = proj.get('technologies', '')
                if isinstance(techs, list):
                    techs = ", ".join(techs)
                self.cell(0, 3.5, self.clean_text(techs))
                self.ln(3.5)
                
                # Description
                self.set_font(self.font_name, "", 8.6)
                self.set_text_color(68, 68, 68)
                self.multi_cell(0, 3.8, self.clean_text(proj.get("description", "")))
                self.ln(1.8)
            self.ln(0.5)

    def draw_skills(self, skills_dict):
        if not skills_dict:
            return
        if self.get_y() > 260:
            self.add_page()
            
        self.draw_section_header("Skills")
        
        for category, skill_list in skills_dict.items():
            if isinstance(skill_list, list):
                skill_list = ", ".join(skill_list)
            self.set_font(self.font_name, "B", 8.8)
            self.set_text_color(51, 51, 51)
            cat_str = f"{category}: "
            self.write(4.2, self.clean_text(cat_str))
            
            self.set_font(self.font_name, "", 8.8)
            self.set_text_color(68, 68, 68)
            self.write(4.2, self.clean_text(skill_list))
            self.ln(4.5)
        self.ln(1.4)

    def draw_publications(self, pub_list):
        if not pub_list:
            return
        if self.get_y() > 260:
            self.add_page()
            
        self.draw_section_header("Publications & Contributions")
        for pub in pub_list:
            self.set_font(self.font_name, "B", 9.1)
            self.set_text_color(51, 51, 51)
            self.cell(0, 4.1, self.clean_text(pub.get("title", "")))
            self.ln(4.1)
            self.set_font(self.font_name, "", 8.6)
            self.set_text_color(68, 68, 68)
            self.cell(0, 3.7, self.clean_text(pub.get("detail", "")))
            self.ln(4.0)

    def draw_activities(self, act_list):
        if not act_list:
            return
        if self.get_y() > 260:
            self.add_page()
            
        self.draw_section_header("Activities & Extracurriculars")
        self.set_font(self.font_name, "", 8.7)
        self.set_text_color(68, 68, 68)
        for act in act_list:
            self.set_x(15)
            self.cell(3.2, 3.9, "-")
            self.multi_cell(0, 3.9, self.clean_text(act))
        self.ln(1.4)

    def draw_references(self, ref_list):
        if not ref_list:
            return
        if self.get_y() > 265:
            self.add_page()
            
        self.draw_section_header("References")
        
        start_y = self.get_y()
        col_width = 88
        
        for idx, ref in enumerate(ref_list):
            x_pos = 12 if idx % 2 == 0 else 105
            y_pos = start_y if idx < 2 else start_y + 18.0 * (idx // 2)
            
            self.set_xy(x_pos, y_pos)
            self.set_font(self.font_name, "B", 9.2)
            self.set_text_color(51, 51, 51)
            self.cell(col_width, 4.1, self.clean_text(ref.get("name", "")))
            
            y_pos += 4.4
            self.set_xy(x_pos, y_pos)
            self.set_font(self.font_name, "I", 8.5)
            self.set_text_color(88, 88, 88)
            self.cell(col_width, 3.7, self.clean_text(ref.get("title", "")))
            
            y_pos += 3.8
            self.set_xy(x_pos, y_pos)
            self.set_font(self.font_name, "", 8.2)
            self.set_text_color(102, 102, 102)
            self.cell(col_width, 3.5, f"Phone: {self.clean_text(ref.get('phone', ''))}")
            
            y_pos += 3.5
            self.set_xy(x_pos, y_pos)
            self.cell(col_width, 3.5, f"Email: {self.clean_text(ref.get('email', ''))}")
            
        self.set_y(start_y + 18.0 * ((len(ref_list) + 1) // 2))

def generate_pdf_resume(data, filepath):
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    pdf = ATSResumePDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # Render all sections (Full portfolio)
    if "personal_info" in data:
        pdf.draw_header(data["personal_info"])
    if "summary" in data:
        pdf.draw_summary(data["summary"])
    if "experience" in data:
        pdf.draw_experience(data["experience"])
    if "education" in data:
        pdf.draw_education(data["education"])
    if "projects" in data:
        pdf.draw_projects(data["projects"])
    if "skills" in data:
        pdf.draw_skills(data["skills"])
    if "publications" in data:
        pdf.draw_publications(data["publications"])
    if "activities" in data:
        pdf.draw_activities(data["activities"])
    if "references" in data:
        pdf.draw_references(data["references"])
        
    pdf.output(filepath)
    print(f"Generated PDF Resume: {filepath} ({pdf.page_no()} pages)")
    return filepath

def generate_html_resume(data, filepath):
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    style = """
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #2d3748;
            line-height: 1.55;
            margin: 0;
            padding: 40px;
            background-color: #f7fafc;
        }
        .container {
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px 48px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border-radius: 4px;
        }
        h1 {
            font-size: 28px;
            margin: 0 0 5px 0;
            color: #1a202c;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .subtitle {
            font-size: 14px;
            font-weight: 600;
            color: #0f4c81;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 14px;
            letter-spacing: 0.5px;
        }
        .contact-info {
            font-size: 12.5px;
            text-align: center;
            color: #718096;
            margin-bottom: 25px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 15px;
        }
        .contact-info a {
            color: #718096;
            text-decoration: none;
        }
        .contact-info a:hover {
            text-decoration: underline;
        }
        h2.section-title {
            font-size: 16px;
            color: #0f4c81;
            text-transform: uppercase;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 4px;
            margin-top: 28px;
            margin-bottom: 14px;
            letter-spacing: 0.5px;
        }
        .summary {
            font-size: 13.5px;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 14px;
            color: #2d3748;
            margin-top: 14px;
        }
        .item-sub {
            font-style: italic;
            font-size: 13px;
            color: #718096;
            margin-bottom: 6px;
        }
        ul {
            margin: 5px 0 12px 0;
            padding-left: 20px;
        }
        li {
            font-size: 13px;
            color: #4a5568;
            margin-bottom: 4px;
            line-height: 1.5;
        }
        .project-item {
            margin-bottom: 18px;
        }
        .project-name {
            font-weight: 700;
            font-size: 13.8px;
            color: #2d3748;
        }
        .project-tech {
            font-style: italic;
            font-size: 12px;
            color: #718096;
            margin-top: 1px;
            margin-bottom: 4px;
        }
        .project-desc {
            font-size: 13px;
            color: #4a5568;
            line-height: 1.55;
        }
        .skills-grid {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }
        .skills-row {
            display: table-row;
        }
        .skills-cat {
            display: table-cell;
            font-weight: 700;
            font-size: 13px;
            width: 140px;
            padding: 5px 0;
            color: #2d3748;
        }
        .skills-val {
            display: table-cell;
            font-size: 13px;
            padding: 5px 0;
            color: #4a5568;
            line-height: 1.5;
        }
        .ref-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
        }
        .ref-col {
            width: 48%;
            font-size: 13px;
        }
        .ref-name {
            font-weight: 700;
            color: #2d3748;
        }
        .ref-title {
            font-style: italic;
            color: #718096;
            margin-bottom: 2px;
        }
        .ref-contact {
            color: #718096;
            font-size: 12px;
        }
        
        @media print {
            body {
                background: #ffffff;
                padding: 0;
                color: #000000;
            }
            .container {
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }
            h2.section-title {
                border-bottom: 1.5px solid #a0aec0;
            }
            .page-break {
                page-break-before: always;
            }
        }
    </style>
    """

    info = data.get("personal_info", {})
    portfolio = info.get("portfolio", "")
    display_portfolio = portfolio.replace('https://', '').replace('http://', '').rstrip('/')
    portfolio_link = f'<a href="https://{display_portfolio}" target="_blank">{display_portfolio}</a> &nbsp;|&nbsp;' if display_portfolio else ''
    
    github = info.get("github", "")
    display_github = github.replace('https://', '').replace('http://', '').rstrip('/')
    linkedin = info.get("linkedin", "")
    display_linkedin = linkedin.replace('https://', '').replace('http://', '').rstrip('/')
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{info.get('name', 'CV')} - ATS Resume</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    {style}
</head>
<body>
    <div class="container">
        <!-- Header -->
        <h1>{info.get('name', '')}</h1>
        <div class="subtitle">{info.get('title', '')}</div>
        <div class="contact-info">
            {info.get('email', '')} &nbsp;|&nbsp; 
            {info.get('phone', '')} &nbsp;|&nbsp; 
            {portfolio_link}
            <a href="https://{display_github}" target="_blank">{display_github}</a> &nbsp;|&nbsp; 
            <a href="https://{display_linkedin}" target="_blank">{display_linkedin}</a>
        </div>

        <!-- Summary -->
        <h2 class="section-title">Profile Summary</h2>
        <div class="summary">
            {data.get('summary', '')}
        </div>

        <!-- Work Experience -->
        <h2 class="section-title">Work Experience</h2>
    """

    for exp in data.get("experience", []):
        html += f"""
        <div class="item-header">
            <span>{exp.get('role', '')} &ndash; {exp.get('company', '')}</span>
            <span>{exp.get('duration', '')}</span>
        </div>
        <ul>
        """
        for bullet in exp.get("bullets", []):
            html += f"<li>{bullet}</li>"
        html += "</ul>"

    # Education
    html += """
        <!-- Education -->
        <h2 class="section-title">Education</h2>
    """
    for edu in data.get("education", []):
        grade_str = f" ({edu['grade']})" if "grade" in edu and edu["grade"] else ""
        html += f"""
        <div class="item-header">
            <span>{edu.get('degree', '')}{grade_str}</span>
            <span>{edu.get('duration', '')}</span>
        </div>
        <div class="item-sub">{edu.get('institution', '')}</div>
        """

    # Projects
    html += """
        <!-- Projects -->
        <h2 class="section-title">Projects</h2>
    """

    # Work Projects
    work_projs = data.get("projects", {}).get("work", [])
    personal_projs = data.get("projects", {}).get("personal", [])
    has_both = bool(work_projs) and bool(personal_projs)

    if work_projs:
        if has_both:
            html += '<div class="item-sub" style="font-weight: 700; font-size: 14px; margin-top: 14px; margin-bottom: 8px;">Work Projects</div>'
        for proj in work_projs:
            techs = proj.get('technologies', '')
            if isinstance(techs, list):
                techs = ", ".join(techs)
            html += f"""
            <div class="project-item">
                <div class="project-name">{proj.get('name', '')}</div>
                <div class="project-tech">{techs}</div>
                <div class="project-desc">{proj.get('description', '')}</div>
            </div>
            """

    # Personal Projects
    if personal_projs:
        if has_both:
            html += '<div class="item-sub" style="font-weight: 700; font-size: 14px; margin-top: 18px; margin-bottom: 8px;">Personal Projects</div>'
        for proj in personal_projs:
            techs = proj.get('technologies', '')
            if isinstance(techs, list):
                techs = ", ".join(techs)
            html += f"""
            <div class="project-item">
                <div class="project-name">{proj.get('name', '')}</div>
                <div class="project-tech">{techs}</div>
                <div class="project-desc">{proj.get('description', '')}</div>
            </div>
            """

    # Skills
    html += """
        <!-- Skills -->
        <h2 class="section-title">Skills</h2>
        <div class="skills-grid">
    """
    for cat, val in data.get("skills", {}).items():
        if isinstance(val, list):
            val = ", ".join(val)
        html += f"""
            <div class="skills-row">
                <div class="skills-cat">{cat}:</div>
                <div class="skills-val">{val}</div>
            </div>
        """
    html += "</div>"

    # Publications
    pubs = data.get("publications", [])
    if pubs:
        html += """
            <!-- Publications -->
            <h2 class="section-title">Publications & Contributions</h2>
        """
        for pub in pubs:
            html += f"""
            <div style="margin-bottom: 10px;">
                <div style="font-weight: 700; font-size: 13.5px;">{pub.get('title', '')}</div>
                <div style="font-size: 13px; color: #4a5568;">{pub.get('detail', '')}</div>
            </div>
            """

    # Activities
    acts = data.get("activities", [])
    if acts:
        html += """
            <!-- Activities -->
            <h2 class="section-title">Activities & Extracurriculars</h2>
            <ul>
        """
        for act in acts:
            html += f"<li>{act}</li>"
        html += "</ul>"

    # References
    refs = data.get("references", [])
    if refs:
        html += """
            <!-- References -->
            <h2 class="section-title">References</h2>
            <div class="ref-grid">
        """
        for ref in refs:
            html += f"""
                <div class="ref-col">
                    <div class="ref-name">{ref.get('name', '')}</div>
                    <div class="ref-title">{ref.get('title', '')}</div>
                    <div class="ref-contact">Phone: {ref.get('phone', '')}</div>
                    <div class="ref-contact">Email: {ref.get('email', '')}</div>
                </div>
            """
        html += """
            </div>
        """

    html += """
    </div>
</body>
</html>
    """

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Generated HTML Resume: {filepath}")
    return filepath

def main():
    parser = argparse.ArgumentParser(description="Generate ATS Resume PDF & HTML from JSON data")
    parser.add_argument("--data", default="resume_data.json", help="Path to input JSON file or raw JSON")
    parser.add_argument("--output", default="my-profile/public/resume.pdf", help="Output PDF file path")
    parser.add_argument("--html", default="", help="Optional output HTML file path")
    
    args = parser.parse_args()

    # Load data
    data = None
    if os.path.exists(args.data):
        with open(args.data, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        # Check if argument is raw JSON string
        try:
            data = json.loads(args.data)
        except Exception:
            # Fallback to local default file
            script_dir = os.path.dirname(os.path.abspath(__file__))
            fallback_json = os.path.join(script_dir, "resume_data.json")
            if os.path.exists(fallback_json):
                with open(fallback_json, "r", encoding="utf-8") as f:
                    data = json.load(f)
            else:
                print(f"Error: Could not locate resume data at {args.data}", file=sys.stderr)
                sys.exit(1)

    # Generate PDF
    pdf_path = generate_pdf_resume(data, args.output)
    
    # If html requested
    if args.html:
        generate_html_resume(data, args.html)

    # Also keep root copy if generating for public
    if "public/resume.pdf" in args.output or "public\\resume.pdf" in args.output:
        try:
            name_slug = data.get("personal_info", {}).get("name", "Resume").replace(" ", "_")
            root_copy = f"CV_{name_slug}.pdf"
            generate_pdf_resume(data, root_copy)
        except Exception:
            pass

if __name__ == "__main__":
    main()
