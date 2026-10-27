import { prisma } from "@/lib/prisma";
import { ProjectCategory } from "@/generated/prisma/client";

export async function getPortfolioData() {
  const [
    projects,
    experiences,
    skills,
    settings,
  ] = await Promise.all([
    // Only published projects ordered by sortOrder
    prisma.project.findMany({
      where: { published: true },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    }),
    // Experiences ordered by sortOrder
    prisma.experience.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { startDate: "desc" },
      ],
    }),
    // Skills ordered by category and sortOrder
    prisma.skill.findMany({
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" },
      ],
    }),
    // Site settings
    prisma.siteSetting.findMany(),
  ]);

  const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const freelanceProjects = projects.filter((p) => p.category === ProjectCategory.FREELANCE);
  const personalProjects = projects.filter((p) => p.category === ProjectCategory.PERSONAL);
  const researchProjects = projects.filter((p) => p.category === ProjectCategory.RESEARCH);
  const gameProjects = projects.filter((p) => p.category === ProjectCategory.GAME);

  // Group skills by category preserving order
  const groupedSkillsMap = new Map<string, string[]>();
  for (const s of skills) {
    if (!groupedSkillsMap.has(s.category)) {
      groupedSkillsMap.set(s.category, []);
    }
    groupedSkillsMap.get(s.category)!.push(s.name);
  }

  const groupedSkills = Array.from(groupedSkillsMap.entries()).map(([title, skillNames]) => ({
    title,
    skills: skillNames,
  }));

  return {
    freelanceProjects,
    personalProjects,
    researchProjects,
    gameProjects,
    experiences,
    skills: groupedSkills,
    profile: {
      name: settingsMap["profile_name"] || "Laknidu Thilakawardhana",
      headline:
        settingsMap["profile_headline"] ||
        "Software Engineer, Researcher, and Builder of interactive web experiences.",
      bio:
        settingsMap["profile_bio"] ||
        "Bridging the gap between design and deep technical engineering. Passionate about AI, Open Source, and crafting digital products that feel alive.",
      aboutP1:
        settingsMap["profile_about_p1"] ||
        "I am a Software Engineer and Researcher with a passion for building scalable web applications and exploring the intersection of design, interaction, and deep technical engineering.",
      aboutP2:
        settingsMap["profile_about_p2"] ||
        "My approach to solving problems involves a healthy mix of rigorous academic research, rapid prototyping, and a relentless focus on the end-user experience. I believe that the best products are not just functional, but delightfully interactive and meticulously crafted.",
      aboutP3:
        settingsMap["profile_about_p3"] ||
        "When I'm not writing code for web platforms or optimizing backend services, you can find me tinkering with game engines, contributing to open-source developer tools, or reading up on the latest advancements in artificial intelligence and human-computer interaction.",
      location: settingsMap["profile_location"] || "United Kingdom",
      resumeUrl: settingsMap["profile_resume_url"] || "/api/resume",
      availability:
        settingsMap["profile_availability"] || "Available for freelance opportunities",
    },
    contact: {
      email: settingsMap["contact_email"] || "hello@example.com",
      github: settingsMap["contact_github"] || "https://github.com",
      linkedin: settingsMap["contact_linkedin"] || "https://linkedin.com",
      twitter: settingsMap["contact_twitter"] || "https://twitter.com",
      title: settingsMap["contact_title"] || "Let's build something amazing together.",
      description:
        settingsMap["contact_description"] ||
        "Whether you have a freelance project, a research opportunity, or just want to say hi, my inbox is always open. I'll try my best to get back to you!",
    },
  };
}

export type PortfolioData = Awaited<ReturnType<typeof getPortfolioData>>;
