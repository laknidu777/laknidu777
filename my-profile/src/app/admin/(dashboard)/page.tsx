import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Layers,
  Globe2,
  FileEdit,
  Briefcase,
  FolderGit2,
  BookOpen,
  Gamepad2,
  Award,
  Sparkles,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { ProjectCategory } from "@/generated/prisma/client";


export default async function AdminDashboardOverview() {
  // Query real database metrics in parallel
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    freelanceProjects,
    personalProjects,
    researchProjects,
    gameProjects,
    totalExperience,
    totalSkills,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.project.count({ where: { published: false } }),
    prisma.project.count({ where: { category: ProjectCategory.FREELANCE } }),
    prisma.project.count({ where: { category: ProjectCategory.PERSONAL } }),
    prisma.project.count({ where: { category: ProjectCategory.RESEARCH } }),
    prisma.project.count({ where: { category: ProjectCategory.GAME } }),
    prisma.experience.count(),
    prisma.skill.count(),
    prisma.project.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        published: true,
        featured: true,
        updatedAt: true,
      },
    }),
  ]);

  const categoryDisplayNames: Record<ProjectCategory, string> = {
    FREELANCE: "Freelance",
    PERSONAL: "Personal Project",
    RESEARCH: "Research",
    GAME: "Game / Experiment",
  };

  const categoryPillColors: Record<ProjectCategory, string> = {
    FREELANCE: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    PERSONAL: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    RESEARCH: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    GAME: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Hero */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/30 via-[#0e0f17] to-purple-900/20 border border-white/10 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Database Connected &bull; PostgreSQL Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Manage your portfolio work, client cases, research publications, resume milestones, and site configuration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/cv"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              <span>CV & Resume Studio</span>
            </Link>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Create Project</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              <ExternalLink size={15} />
              <span>Public Preview</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{totalProjects}</div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
            <span className="text-emerald-400 font-medium">{publishedProjects} published</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-medium">{draftProjects} drafts</span>
          </div>
        </div>

        {/* Published Projects */}
        <div className="bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Content</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Globe2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{publishedProjects}</div>
          <div className="text-xs text-gray-400 mt-2">
            Visible on the public portfolio website
          </div>
        </div>

        {/* Experience Milestones */}
        <div className="bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Work Experience</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{totalExperience}</div>
          <div className="text-xs text-gray-400 mt-2">
            Career roles & milestones listed
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Skills Catalog</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{totalSkills}</div>
          <div className="text-xs text-gray-400 mt-2">
            Across frontend, backend, tools & more
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Project Categories</h2>
          <span className="text-xs text-gray-400">Click category to manage items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Freelance */}
          <Link
            href="/admin/freelance"
            className="group bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 hover:bg-[#0e0f19] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Briefcase size={20} />
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
              Freelance Projects
            </div>
            <div className="text-2xl font-bold text-white mt-1">{freelanceProjects}</div>
            <p className="text-xs text-gray-400 mt-2">Client solutions, case studies & impact</p>
          </Link>

          {/* Personal */}
          <Link
            href="/admin/personal"
            className="group bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/40 hover:bg-[#0e0f19] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <FolderGit2 size={20} />
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
              Personal Projects
            </div>
            <div className="text-2xl font-bold text-white mt-1">{personalProjects}</div>
            <p className="text-xs text-gray-400 mt-2">Independent builds & open source</p>
          </Link>

          {/* Research */}
          <Link
            href="/admin/research"
            className="group bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 hover:bg-[#0e0f19] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
              Research & Papers
            </div>
            <div className="text-2xl font-bold text-white mt-1">{researchProjects}</div>
            <p className="text-xs text-gray-400 mt-2">Publications, academic papers & findings</p>
          </Link>

          {/* Games */}
          <Link
            href="/admin/games"
            className="group bg-[#0b0c13] border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 hover:bg-[#0e0f19] transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Gamepad2 size={20} />
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
              Games & Interactive
            </div>
            <div className="text-2xl font-bold text-white mt-1">{gameProjects}</div>
            <p className="text-xs text-gray-400 mt-2">Game engines, prototypes & demos</p>
          </Link>
        </div>
      </div>

      {/* Recent Projects Table & Publication Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 cols) */}
        <div className="lg:col-span-2 bg-[#0b0c13] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Recently Updated Projects</h2>
              <p className="text-xs text-gray-400 mt-0.5">Direct quick edits and status checks</p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No projects added yet. Click &quot;Create Project&quot; to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentProjects.map((p) => (
                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">/{p.slug}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${
                            categoryPillColors[p.category]
                          }`}
                        >
                          {categoryDisplayNames[p.category]}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        {p.published ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/projects/${p.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                        >
                          <FileEdit size={13} />
                          <span>Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Publication Summary & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Published vs Draft Distribution */}
          <div className="bg-[#0b0c13] border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Content Release Status</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-gray-300">Published Content</span>
                  <span className="text-emerald-400">
                    {totalProjects > 0 ? Math.round((publishedProjects / totalProjects) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalProjects > 0 ? (publishedProjects / totalProjects) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-gray-300">Unpublished Drafts</span>
                  <span className="text-amber-400">
                    {totalProjects > 0 ? Math.round((draftProjects / totalProjects) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalProjects > 0 ? (draftProjects / totalProjects) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>Live sync active</span>
              </span>
              <span>Total items: {totalProjects}</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#0b0c13] border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                href="/admin/experience"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Award size={15} className="text-purple-400" />
                  <span>Update Work Experience</span>
                </div>
                <ArrowUpRight size={13} className="text-gray-400" />
              </Link>
              <Link
                href="/admin/skills"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-cyan-400" />
                  <span>Manage Technical Skills</span>
                </div>
                <ArrowUpRight size={13} className="text-gray-400" />
              </Link>
              <Link
                href="/admin/profile"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-indigo-400" />
                  <span>Edit Profile & Bio Text</span>
                </div>
                <ArrowUpRight size={13} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
