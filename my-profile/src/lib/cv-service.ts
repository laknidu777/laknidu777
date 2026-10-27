import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export interface CvPersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  portfolio: string;
  github: string;
  linkedin: string;
}

export interface CvExperience {
  role: string;
  company: string;
  duration: string;
  bullets: string[];
}

export interface CvEducation {
  degree: string;
  institution: string;
  duration: string;
  grade?: string;
}

export interface CvProjectItem {
  name: string;
  technologies: string;
  description: string;
}

export interface CvProjects {
  work: CvProjectItem[];
  personal: CvProjectItem[];
}

export interface CvPublication {
  title: string;
  detail: string;
}

export interface CvReference {
  name: string;
  title: string;
  phone: string;
  email: string;
}

export interface CvData {
  personal_info: CvPersonalInfo;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  projects: CvProjects;
  skills: Record<string, string>;
  publications: CvPublication[];
  activities: string[];
  references: CvReference[];
}

export const defaultCvData: CvData = {
  personal_info: {
    name: "Laknidu Thilakawardhana",
    title: "DevOps & Software Engineer",
    email: "laknidut@gmail.com",
    phone: "+44 7700 900123",
    portfolio: "laknidu.dev",
    github: "github.com/laknidu777",
    linkedin: "linkedin.com/in/laknidu-thilakawardhana-411783247",
  },
  summary:
    "DevOps and Software Engineer with proven expertise in orchestrating scalable cloud infrastructure, automated CI/CD pipelines, and high-performance full-stack applications. Experienced in Docker, Kubernetes, AWS, and modern microservices using .NET, NestJS, and Next.js. Dedicated to system reliability, infrastructure-as-code, and crafting frictionless developer workflows.",
  experience: [
    {
      role: "Senior Software & DevOps Engineer",
      company: "TechNova Solutions",
      duration: "Jan 2024 - Present",
      bullets: [
        "Architected and managed scalable cloud deployments on AWS with automated CI/CD pipelines using GitHub Actions, cutting release cycles by 55%.",
        "Implemented micro-frontend architectures with Next.js and optimized backend rendering pipelines, resulting in a 40% reduction in latency.",
        "Containerized core services with Docker and orchestrated workloads on Kubernetes, maintaining 99.98% system uptime.",
      ],
    },
    {
      role: "Full Stack Developer",
      company: "Creative Digital Agency",
      duration: "Jun 2021 - Dec 2023",
      bullets: [
        "Engineered interactive web applications for high-profile client systems using Node.js, Next.js, and PostgreSQL with Prisma ORM.",
        "Automated provisioning with Ansible scripts and configured Nginx reverse proxies with SSL termination for production clusters.",
        "Built modular RESTful APIs and mentored junior software engineers in clean code and test-driven development.",
      ],
    },
    {
      role: "Research Assistant",
      company: "University Human-Computer Interaction Lab",
      duration: "Sep 2019 - May 2021",
      bullets: [
        "Conducted empirical research on novel interaction paradigms and real-time collaboration tools with WebSockets and D3.js.",
        "Co-authored 2 research papers accepted at premier ACM conferences (CHI & UIST).",
      ],
    },
  ],
  education: [
    {
      degree: "BSc (Hons) in Software Engineering",
      institution: "University of Plymouth",
      duration: "2021 - 2024",
      grade: "First Class Honours",
    },
  ],
  projects: {
    work: [
      {
        name: "COCO VANTAGE",
        technologies:
          "NestJs, NextJs, Typescript, Docker, Prisma, PostgreSQL, Neon",
        description:
          "Developed an e-commerce platform for charcoal-based deodorizer products, enabling customers to browse products, place orders, make secure online payments through Stripe, and track their shipments. The platform includes an administrative dashboard for managing sales, inventory, and order fulfillment.",
      },
      {
        name: "Kivi",
        technologies: "Flutter, Dart, NestJs, PostgreSQL",
        description:
          "Designed and developed a cloud-based Point-of-Sale (POS) system for small and medium-sized enterprises (SMEs), offering a subscription-based business model. Built to support sales and inventory operations across devices, the platform enables businesses to manage products, track inventory, and add items using mobile phones or PCs, with barcode scanning and both online and offline functionality.",
      },
    ],
    personal: [],
  },
  skills: {
    "Cloud & DevOps": "AWS, Docker, Kubernetes, Ansible, GitHub Actions, GitLab, Git, Nginx, Apache",
    "Frontend & Mobile": "Next.js, React Native, Flutter, JavaScript, Dart, Tailwind CSS",
    "Backend & Services": ".NET, NestJS, Node.js, C#, PHP, C++, REST APIs",
    "Databases & ORM": "PostgreSQL, MySQL, MongoDB, Microsoft SQL Server, Prisma, Firebase",
    "Tools & Scripting": "PowerShell, Postman, Vercel, Canva, Linux",
  },
  publications: [
    {
      title: "Interactive Visualization of Quantum State Transitions in Web Environments",
      detail: "ACM Conference on Human Factors in Computing Systems (CHI) • 2023",
    },
    {
      title: "Analyzing the Impact of Micro-Animations on User Retention in SaaS Platforms",
      detail: "ACM Symposium on User Interface Software and Technology (UIST)",
    },
  ],
  activities: [
    "Active Open Source Contributor across cloud infrastructure, developer toolkits, and DevOps automation.",
    "Technical mentor at campus developer student clubs and hackathons focusing on cloud-native computing.",
  ],
  references: [
    {
      name: "University of Plymouth Academic Reference",
      title: "Department of Computing & Engineering",
      phone: "+44 (0)1752 585858",
      email: "computing@plymouth.ac.uk",
    },
    {
      name: "Enterprise Systems Industry Reference",
      title: "Technical Lead, Cloud & Infrastructure",
      phone: "+44 7700 900456",
      email: "director@enterprisetech.co.uk",
    },
  ],
};

/**
 * Get current CV data from Database, or fall back to resume_data.json / default
 */
export async function getCvData(): Promise<CvData> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "cv_data" },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        return {
          ...defaultCvData,
          ...parsed,
          personal_info: { ...defaultCvData.personal_info, ...(parsed.personal_info || {}) },
          projects: { ...defaultCvData.projects, ...(parsed.projects || {}) },
        };
      } catch (e) {
        console.error("Error parsing cv_data JSON from database:", e);
      }
    }
  } catch (err) {
    console.error("Database query for cv_data failed, falling back to file:", err);
  }

  // Fallback to local resume_data.json
  try {
    const cwd = process.cwd();
    const jsonPath = path.resolve(cwd, "resume_data.json");
    const fileContent = await fs.readFile(jsonPath, "utf-8");
    return JSON.parse(fileContent);
  } catch {
    return defaultCvData;
  }
}

/**
 * Save updated CV data to database, mirror to file, and compile PDF
 */
export async function saveCvData(data: CvData): Promise<{ success: boolean; error?: string }> {
  try {
    const jsonString = JSON.stringify(data, null, 2);

    // 1. Save to Database
    await prisma.siteSetting.upsert({
      where: { key: "cv_data" },
      update: { value: jsonString },
      create: { key: "cv_data", value: jsonString },
    });

    // 2. Mirror to file system (my-profile/resume_data.json and root resume_data.json)
    const cwd = process.cwd();
    const localJson = path.resolve(cwd, "resume_data.json");
    const rootJson = path.resolve(cwd, "..", "resume_data.json");

    await Promise.allSettled([
      fs.writeFile(localJson, jsonString, "utf-8"),
      fs.writeFile(rootJson, jsonString, "utf-8"),
    ]);

    // 3. Trigger PDF compilation
    await generateResumePdf(data);

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to save CV data:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save CV data",
    };
  }
}

/**
 * Call Python generator script to compile ATS resume PDF
 */
export async function generateResumePdf(
  data?: CvData
): Promise<{ success: boolean; error?: string; pdfPath?: string }> {
  try {
    const cwd = process.cwd();
    const currentData = data || (await getCvData());

    // Write temp JSON file for python to consume reliably
    const tempJsonPath = path.resolve(cwd, "resume_data.json");
    await fs.writeFile(tempJsonPath, JSON.stringify(currentData, null, 2), "utf-8");

    // Output public PDF
    const publicPdfPath = path.resolve(cwd, "public", "resume.pdf");
    const publicHtmlPath = path.resolve(cwd, "public", "resume.html");

    // Check script paths
    const scriptInScripts = path.resolve(cwd, "scripts", "generate_resume.py");
    const scriptInRoot = path.resolve(cwd, "..", "generate_resume.py");
    const hasInScripts = await fs.stat(scriptInScripts).catch(() => null);
    const hasInRoot = await fs.stat(scriptInRoot).catch(() => null);
    const scriptPath = hasInScripts ? scriptInScripts : hasInRoot ? scriptInRoot : null;

    if (!scriptPath) {
      console.warn("Resume generator script not found; skipping dynamic compilation.");
      return { success: false, error: "Resume generator script not found" };
    }

    const command = `python3 "${scriptPath}" --data "${tempJsonPath}" --output "${publicPdfPath}" --html "${publicHtmlPath}"`;

    try {
      await execAsync(command, { cwd });
    } catch {
      // Fallback to python if python3 is not the alias (e.g. Windows)
      const winCommand = `python "${scriptPath}" --data "${tempJsonPath}" --output "${publicPdfPath}" --html "${publicHtmlPath}"`;
      await execAsync(winCommand, { cwd });
    }

    return { success: true, pdfPath: "/resume.pdf" };
  } catch (err: unknown) {
    console.error("PDF generation via Python failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "PDF generation failed",
    };
  }
}

/**
 * Automatically sync CV when a new project is created or updated
 */
export async function syncCvWithProject(project: {
  title: string;
  category: string;
  technologies: string[];
  description: string;
  summary: string;
  published: boolean;
}): Promise<void> {
  try {
    if (!project.published) return;

    const cvData = await getCvData();
    const techStr = project.technologies.join(", ");
    const descStr = project.description || project.summary || "";

    const isWork = project.category === "FREELANCE";
    const targetList = isWork ? cvData.projects.work : cvData.projects.personal;

    const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_]+/g, "");
    const existingIndex = targetList.findIndex(
      (p) => normalize(p.name) === normalize(project.title)
    );

    if (existingIndex >= 0) {
      targetList[existingIndex] = {
        name: project.title,
        technologies: techStr,
        description: descStr,
      };
    } else {
      targetList.unshift({
        name: project.title,
        technologies: techStr,
        description: descStr,
      });
    }

    // Save and re-compile PDF
    await saveCvData(cvData);
    console.log(`✓ Automatically synchronized project "${project.title}" into ATS Resume.`);
  } catch (e) {
    console.error("Auto-sync project with CV failed:", e);
  }
}

/**
 * Full synchronization pulling all database projects, experiences, and skills into CV format
 */
export async function syncCvFromPortfolioDatabase(): Promise<{
  success: boolean;
  data?: CvData;
  error?: string;
}> {
  try {
    const [dbProjects, dbExperiences, dbSkills, dbSettings] = await Promise.all([
      prisma.project.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.experience.findMany({
        orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
      }),
      prisma.skill.findMany({
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.siteSetting.findMany(),
    ]);

    const settingsMap = dbSettings.reduce<Record<string, string>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const currentCv = await getCvData();

    // Map projects
    const workProjects: CvProjectItem[] = dbProjects
      .filter((p) => p.category === "FREELANCE")
      .map((p) => ({
        name: p.title,
        technologies: p.technologies.join(", "),
        description: p.description || p.summary,
      }));

    const personalProjects: CvProjectItem[] = dbProjects
      .filter((p) => p.category !== "FREELANCE")
      .map((p) => ({
        name: p.title,
        technologies: p.technologies.join(", "),
        description: p.description || p.summary,
      }));

    // Map experiences
    const experiences: CvExperience[] = dbExperiences.map((e) => {
      const start = new Date(e.startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const end = e.current
        ? "Present"
        : e.endDate
        ? new Date(e.endDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Present";

      // Split description by period or line into bullets if needed
      const rawBullets = e.description
        .split(/(?<=[.!?])\s+/)
        .map((b) => b.trim())
        .filter((b) => b.length > 10);

      return {
        role: e.position,
        company: e.company,
        duration: `${start} - ${end}`,
        bullets: rawBullets.length > 0 ? rawBullets : [e.description],
      };
    });

    // Map skills
    const skillsMap: Record<string, string[]> = {};
    for (const s of dbSkills) {
      if (!skillsMap[s.category]) {
        skillsMap[s.category] = [];
      }
      skillsMap[s.category].push(s.name);
    }
    const groupedSkills: Record<string, string> = {};
    for (const [cat, items] of Object.entries(skillsMap)) {
      groupedSkills[cat] = items.join(", ");
    }

    const mergedCv: CvData = {
      ...currentCv,
      personal_info: {
        name: settingsMap["profile_name"] || currentCv.personal_info.name,
        title: settingsMap["profile_headline"] || currentCv.personal_info.title,
        email: settingsMap["contact_email"] || currentCv.personal_info.email,
        phone: currentCv.personal_info.phone,
        portfolio: currentCv.personal_info.portfolio,
        github: settingsMap["contact_github"]
          ? settingsMap["contact_github"].replace("https://", "")
          : currentCv.personal_info.github,
        linkedin: settingsMap["contact_linkedin"]
          ? settingsMap["contact_linkedin"].replace("https://", "")
          : currentCv.personal_info.linkedin,
      },
      summary: settingsMap["profile_bio"] || currentCv.summary,
      projects: {
        work: workProjects.length > 0 ? workProjects : currentCv.projects.work,
        personal: personalProjects.length > 0 ? personalProjects : currentCv.projects.personal,
      },
      experience: experiences.length > 0 ? experiences : currentCv.experience,
      skills: Object.keys(groupedSkills).length > 0 ? groupedSkills : currentCv.skills,
    };

    await saveCvData(mergedCv);
    return { success: true, data: mergedCv };
  } catch (err: unknown) {
    console.error("Full database sync failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}
