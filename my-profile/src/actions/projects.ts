"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { projectSchema, ProjectInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { syncCvWithProject } from "@/lib/cv-service";

export async function createProject(data: ProjectInput) {
  await requireAdmin();

  const validated = projectSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validation failed",
    };
  }

  const { slug, ...rest } = validated.data;

  // Check unique slug
  const existing = await prisma.project.findUnique({
    where: { slug },
  });

  if (existing) {
    return {
      success: false,
      error: `A project with the slug "${slug}" already exists. Please choose a different slug.`,
    };
  }

  try {
    const project = await prisma.project.create({
      data: {
        slug,
        title: rest.title,
        summary: rest.summary,
        description: rest.description,
        category: rest.category,
        imageUrl: rest.imageUrl || null,
        projectUrl: rest.projectUrl || null,
        githubUrl: rest.githubUrl || null,
        technologies: rest.technologies,
        featured: rest.featured,
        published: rest.published,
        sortOrder: rest.sortOrder,
        client: rest.client || null,
        role: rest.role || null,
        impact: rest.impact || null,
        statusText: rest.statusText || null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/freelance");
    revalidatePath("/admin/personal");
    revalidatePath("/admin/research");
    revalidatePath("/admin/games");
    revalidatePath("/admin/cv");
    revalidatePath("/");

    // Auto-update CV and compile latest PDF if published
    if (project.published) {
      syncCvWithProject(project).catch((err) =>
        console.error("Failed to auto-sync CV on create:", err)
      );
    }

    return { success: true, data: project };
  } catch (err: unknown) {
    console.error("Failed to create project:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create project in database",
    };
  }
}

export async function updateProject(id: string, data: ProjectInput) {
  await requireAdmin();

  if (!id) {
    return { success: false, error: "Project ID is required" };
  }

  const validated = projectSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validation failed",
    };
  }

  const { slug, ...rest } = validated.data;

  // Check if slug taken by another project
  const existing = await prisma.project.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  });

  if (existing) {
    return {
      success: false,
      error: `Another project already uses the slug "${slug}". Please pick another.`,
    };
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        slug,
        title: rest.title,
        summary: rest.summary,
        description: rest.description,
        category: rest.category,
        imageUrl: rest.imageUrl || null,
        projectUrl: rest.projectUrl || null,
        githubUrl: rest.githubUrl || null,
        technologies: rest.technologies,
        featured: rest.featured,
        published: rest.published,
        sortOrder: rest.sortOrder,
        client: rest.client || null,
        role: rest.role || null,
        impact: rest.impact || null,
        statusText: rest.statusText || null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/freelance");
    revalidatePath("/admin/personal");
    revalidatePath("/admin/research");
    revalidatePath("/admin/games");
    revalidatePath(`/admin/projects/${id}/edit`);
    revalidatePath("/admin/cv");
    revalidatePath("/");

    // Auto-update CV and compile latest PDF if published
    if (project.published) {
      syncCvWithProject(project).catch((err) =>
        console.error("Failed to auto-sync CV on update:", err)
      );
    }

    return { success: true, data: project };
  } catch (err: unknown) {
    console.error("Failed to update project:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update project",
    };
  }
}

export async function deleteProject(id: string) {
  await requireAdmin();

  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/freelance");
    revalidatePath("/admin/personal");
    revalidatePath("/admin/research");
    revalidatePath("/admin/games");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete project:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete project",
    };
  }
}

export async function toggleProjectPublish(id: string, published: boolean) {
  await requireAdmin();

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: { published },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/freelance");
    revalidatePath("/admin/personal");
    revalidatePath("/admin/research");
    revalidatePath("/admin/games");
    revalidatePath("/admin/cv");
    revalidatePath("/");

    if (updated.published) {
      syncCvWithProject(updated).catch((err) =>
        console.error("Failed to auto-sync CV on publish toggle:", err)
      );
    }

    return { success: true, published: updated.published };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update publish state",
    };
  }
}

export async function toggleProjectFeatured(id: string, featured: boolean) {
  await requireAdmin();

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: { featured },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/freelance");
    revalidatePath("/admin/personal");
    revalidatePath("/admin/research");
    revalidatePath("/admin/games");
    revalidatePath("/");

    return { success: true, featured: updated.featured };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update featured state",
    };
  }
}
