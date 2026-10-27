import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  projectSchema,
  experienceSchema,
  skillSchema,
  profileSettingsSchema,
  contactSettingsSchema,
} from "../lib/validations";
import { ProjectCategory } from "../types/project";

describe("Input Validation Schemas", () => {
  describe("projectSchema", () => {
    it("should accept valid project data", () => {
      const valid = {
        title: "Cloud Migration Pipeline",
        slug: "cloud-migration-pipeline",
        summary: "Automated AWS infrastructure migration using Terraform.",
        description: "Comprehensive end-to-end cloud migration architecture with zero downtime.",
        category: ProjectCategory.FREELANCE,
        technologies: ["AWS", "Docker", "Terraform"],
        featured: true,
        published: true,
        sortOrder: 1,
      };
      const result = projectSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it("should reject invalid slug format", () => {
      const invalid = {
        title: "Test Project",
        slug: "Invalid Slug With Spaces!",
        summary: "Valid summary string.",
        description: "Valid description string longer than 10 chars.",
        category: ProjectCategory.PERSONAL,
      };
      const result = projectSchema.safeParse(invalid);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.path.includes("slug")));
      }
    });

    it("should reject missing required fields", () => {
      const invalid = {
        title: "A", // too short
        slug: "valid-slug",
      };
      const result = projectSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  describe("experienceSchema", () => {
    it("should accept valid experience entry", () => {
      const valid = {
        company: "Acme Corp",
        position: "DevOps Engineer",
        description: "Architected CI/CD workflows using GitHub Actions and ArgoCD.",
        startDate: "2024-01-01",
        current: true,
        technologies: ["Kubernetes", "Docker"],
      };
      const result = experienceSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it("should reject short description", () => {
      const invalid = {
        company: "Acme Corp",
        position: "DevOps Engineer",
        description: "Too short",
        startDate: "2024-01-01",
      };
      const result = experienceSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  describe("skillSchema", () => {
    it("should accept valid skill and category", () => {
      const valid = {
        name: "Kubernetes",
        category: "Cloud & DevOps",
        level: 90,
        sortOrder: 1,
      };
      const result = skillSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it("should reject skill with level > 100", () => {
      const invalid = {
        name: "Go",
        category: "Backend",
        level: 150,
      };
      const result = skillSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  describe("profileSettingsSchema", () => {
    it("should accept valid profile settings", () => {
      const valid = {
        profile_name: "John Doe",
        profile_headline: "Senior Software Engineer",
        profile_bio: "Experienced developer building modern cloud applications.",
      };
      const result = profileSettingsSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it("should reject missing required profile fields", () => {
      const invalid = {
        profile_name: "J", // too short
      };
      const result = profileSettingsSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  describe("contactSettingsSchema", () => {
    it("should accept valid email and URL configurations", () => {
      const valid = {
        contact_email: "engineer@example.com",
        contact_github: "https://github.com/developer",
        contact_linkedin: "https://linkedin.com/in/developer",
      };
      const result = contactSettingsSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    it("should reject malformed email", () => {
      const invalid = {
        contact_email: "not-an-email",
      };
      const result = contactSettingsSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });
});
