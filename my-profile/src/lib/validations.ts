import { z } from "zod";
import { ProjectCategory } from "@/types/project";

export const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(150, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  summary: z.string().min(5, "Summary must be at least 5 characters").max(500, "Summary is too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.nativeEnum(ProjectCategory, {
    message: "Invalid category selected",
  }),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  projectUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  technologies: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  client: z.string().max(100).optional().or(z.literal("")),
  role: z.string().max(100).optional().or(z.literal("")),
  impact: z.string().max(300).optional().or(z.literal("")),
  statusText: z.string().max(60).optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const experienceSchema = z.object({
  company: z.string().min(2, "Company is required").max(100),
  position: z.string().min(2, "Position is required").max(100),
  location: z.string().max(100).optional().or(z.literal("")),
  employmentType: z.string().max(50).optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean().default(false),
  technologies: z.array(z.string().min(1)).default([]),
  sortOrder: z.coerce.number().int().default(0),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(60),
  category: z.string().min(2, "Category is required").max(60),
  level: z.coerce.number().int().min(1).max(100).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export type SkillInput = z.infer<typeof skillSchema>;

export const profileSettingsSchema = z.object({
  profile_name: z.string().min(2, "Name is required").max(100),
  profile_headline: z.string().min(5, "Headline is required").max(200),
  profile_bio: z.string().min(10, "Bio is required").max(500),
  profile_about_p1: z.string().optional().or(z.literal("")),
  profile_about_p2: z.string().optional().or(z.literal("")),
  profile_about_p3: z.string().optional().or(z.literal("")),
  profile_location: z.string().max(100).optional().or(z.literal("")),
  profile_resume_url: z.string().max(255).optional().or(z.literal("")),
  profile_availability: z.string().max(100).optional().or(z.literal("")),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

export const contactSettingsSchema = z.object({
  contact_email: z.string().email("Valid email required"),
  contact_github: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
  contact_linkedin: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
  contact_twitter: z.string().url("Must be a full URL starting with https://").optional().or(z.literal("")),
  contact_title: z.string().max(120).optional().or(z.literal("")),
  contact_description: z.string().max(500).optional().or(z.literal("")),
});

export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Please provide a valid email address"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(150, "Subject is too long"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000, "Message is too long"),
  honeypot: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

