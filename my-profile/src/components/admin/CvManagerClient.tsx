"use client";

import { useState } from "react";
import {
  FileText,
  Save,
  RefreshCw,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Sparkles,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  CvData,
  CvProjectItem,
  CvExperience,
  CvEducation,
  CvPublication,
  CvReference,
} from "@/lib/cv-service";
import {
  saveCvAction,
  regenerateCvPdfAction,
  syncCvFromDbAction,
} from "@/actions/cv";

interface AvailableProject {
  id: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  technologies: string[];
}

interface CvManagerClientProps {
  initialData: CvData;
  availableProjects: AvailableProject[];
}

type TabType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "publications"
  | "references"
  | "preview";

export default function CvManagerClient({
  initialData,
  availableProjects,
}: CvManagerClientProps) {
  const [data, setData] = useState<CvData>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal for project import
  const [showImportModal, setShowImportModal] = useState<"work" | "personal" | null>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // 1. Save CV
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveCvAction(data);
      if (res.success) {
        showNotification(
          "success",
          "CV data saved successfully & ATS PDF re-compiled!"
        );
      } else {
        showNotification("error", res.error || "Failed to save CV data");
      }
    } catch {
      showNotification("error", "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // 2. Regenerate PDF
  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await regenerateCvPdfAction();
      if (res.success) {
        showNotification("success", "PDF successfully compiled via Python ATS Engine!");
      } else {
        showNotification("error", res.error || "Failed to compile PDF.");
      }
    } catch {
      showNotification("error", "An error occurred during PDF regeneration.");
    } finally {
      setRegenerating(false);
    }
  };

  // 3. Sync from Database
  const handleSyncFromDb = async () => {
    if (
      !confirm(
        "Are you sure you want to sync from the portfolio database? This will refresh projects, experiences, skills, and personal info from your portfolio data."
      )
    ) {
      return;
    }
    setSyncing(true);
    try {
      const res = await syncCvFromDbAction();
      if (res.success && res.data) {
        setData(res.data);
        showNotification("success", "Successfully synchronized from Portfolio Database!");
      } else {
        showNotification("error", res.error || "Failed to sync from database.");
      }
    } catch {
      showNotification("error", "Database sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  // Helpers for Experience Bullets
  const handleAddBullet = (expIndex: number) => {
    const nextExp = [...data.experience];
    nextExp[expIndex].bullets.push("New responsibility or achievement...");
    setData({ ...data, experience: nextExp });
  };

  const handleUpdateBullet = (expIndex: number, bulletIndex: number, val: string) => {
    const nextExp = [...data.experience];
    nextExp[expIndex].bullets[bulletIndex] = val;
    setData({ ...data, experience: nextExp });
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const nextExp = [...data.experience];
    nextExp[expIndex].bullets.splice(bulletIndex, 1);
    setData({ ...data, experience: nextExp });
  };

  // Helpers for Projects
  const handleImportProject = (proj: AvailableProject, target: "work" | "personal") => {
    const newItem: CvProjectItem = {
      name: proj.title,
      technologies: proj.technologies.join(", "),
      description: proj.description || proj.summary,
    };

    const nextProjects = { ...data.projects };
    if (target === "work") {
      nextProjects.work = [newItem, ...nextProjects.work];
    } else {
      nextProjects.personal = [newItem, ...nextProjects.personal];
    }
    setData({ ...data, projects: nextProjects });
    setShowImportModal(null);
    showNotification("success", `Added "${proj.title}" to ${target} projects.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-[#0d0e15] to-purple-950/30 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              CV & ATS Resume Studio
            </h1>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl">
            Edit your ATS-optimized resume. Changes are compiled into a professional 2-page PDF
            using the Python ATS Engine and automatically synced with your live portfolio.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncFromDb}
            disabled={syncing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 border border-white/10 transition-all disabled:opacity-50"
            title="Import latest records from portfolio database"
          >
            <Database size={15} className={syncing ? "animate-spin text-indigo-400" : "text-gray-400"} />
            <span>{syncing ? "Syncing..." : "Sync DB"}</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 border border-white/10 transition-all disabled:opacity-50"
            title="Re-run Python ATS generator"
          >
            <RefreshCw size={15} className={regenerating ? "animate-spin text-purple-400" : "text-gray-400"} />
            <span>{regenerating ? "Compiling..." : "Re-compile PDF"}</span>
          </button>

          <a
            href="/api/resume"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 transition-all shadow-sm"
          >
            <Download size={15} className="text-emerald-400" />
            <span>Download PDF</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save & Update CV"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/40 border-red-500/30 text-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-white/10 scrollbar-none">
        {[
          { id: "personal", label: "Personal Info", icon: User },
          { id: "summary", label: "Summary", icon: FileText },
          { id: "experience", label: "Experience", icon: Briefcase },
          { id: "education", label: "Education", icon: GraduationCap },
          { id: "projects", label: "Projects", icon: FolderGit2 },
          { id: "skills", label: "Skills", icon: Sparkles },
          { id: "publications", label: "Publications & Activities", icon: BookOpen },
          { id: "references", label: "References", icon: Users },
          { id: "preview", label: "Live ATS Preview", icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. PERSONAL INFO */}
      {activeTab === "personal" && (
        <div className="bg-[#0e0f17] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-semibold text-white">Header & Contact Details</h2>
            <p className="text-xs text-gray-400">
              Displayed prominently at the very top of your ATS resume with clickable links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={data.personal_info.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, name: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Professional Title
              </label>
              <input
                type="text"
                value={data.personal_info.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, title: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={data.personal_info.email}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, email: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={data.personal_info.phone}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, phone: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Portfolio Domain (without https://)
              </label>
              <input
                type="text"
                value={data.personal_info.portfolio}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, portfolio: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                GitHub Handle / Link
              </label>
              <input
                type="text"
                value={data.personal_info.github}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, github: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                LinkedIn Handle / Link
              </label>
              <input
                type="text"
                value={data.personal_info.linkedin}
                onChange={(e) =>
                  setData({
                    ...data,
                    personal_info: { ...data.personal_info, linkedin: e.target.value },
                  })
                }
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SUMMARY */}
      {activeTab === "summary" && (
        <div className="bg-[#0e0f17] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-base font-semibold text-white">Profile Summary (ATS Executive Hook)</h2>
            <p className="text-xs text-gray-400">
              A 2-4 sentence executive overview targeted at technical recruiters and ATS scanners.
            </p>
          </div>

          <div>
            <textarea
              rows={6}
              value={data.summary}
              onChange={(e) => setData({ ...data, summary: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Write your ATS profile summary..."
            />
            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
              <span>Aim for 40-70 words highlighting core strengths (DevOps, Cloud, Full-stack).</span>
              <span>{data.summary.length} characters | {data.summary.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPERIENCE */}
      {activeTab === "experience" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0e0f17] border border-white/10 rounded-2xl p-4">
            <div>
              <h2 className="text-base font-semibold text-white">Work Experience</h2>
              <p className="text-xs text-gray-400">
                Action-oriented bullet points with quantifiable impact.
              </p>
            </div>
            <button
              onClick={() => {
                const newExp: CvExperience = {
                  role: "DevOps / Software Engineer",
                  company: "Company Name",
                  duration: "Jan 2024 - Present",
                  bullets: ["Engineered scalable cloud infrastructure..."],
                };
                setData({ ...data, experience: [newExp, ...data.experience] });
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
            >
              <Plus size={14} />
              <span>Add Experience</span>
            </button>
          </div>

          {data.experience.map((exp, expIdx) => (
            <div
              key={expIdx}
              className="bg-[#0e0f17] border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Position #{expIdx + 1}
                </span>
                <button
                  onClick={() => {
                    const next = [...data.experience];
                    next.splice(expIdx, 1);
                    setData({ ...data, experience: next });
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Remove this experience"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[expIdx].role = e.target.value;
                      setData({ ...data, experience: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[expIdx].company = e.target.value;
                      setData({ ...data, experience: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[expIdx].duration = e.target.value;
                      setData({ ...data, experience: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Jan 2024 - Present"
                  />
                </div>
              </div>

              {/* Bullet Points */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-300">Bullet Points (Achievements)</span>
                  <button
                    onClick={() => handleAddBullet(expIdx)}
                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={13} />
                    <span>Add Bullet</span>
                  </button>
                </div>

                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-2">&bull;</span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                    <button
                      onClick={() => handleRemoveBullet(expIdx, bIdx)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg mt-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. EDUCATION */}
      {activeTab === "education" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0e0f17] border border-white/10 rounded-2xl p-4">
            <div>
              <h2 className="text-base font-semibold text-white">Education & Credentials</h2>
              <p className="text-xs text-gray-400">Degrees, academic institutions, and honours.</p>
            </div>
            <button
              onClick={() => {
                const newEdu: CvEducation = {
                  degree: "BSc (Hons) in Software Engineering",
                  institution: "University of Plymouth",
                  duration: "2021 - 2024",
                  grade: "First Class Honours",
                };
                setData({ ...data, education: [...data.education, newEdu] });
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
            >
              <Plus size={14} />
              <span>Add Education</span>
            </button>
          </div>

          {data.education.map((edu, idx) => (
            <div
              key={idx}
              className="bg-[#0e0f17] border border-white/10 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-semibold text-indigo-400">Degree #{idx + 1}</span>
                <button
                  onClick={() => {
                    const next = [...data.education];
                    next.splice(idx, 1);
                    setData({ ...data, education: next });
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx].degree = e.target.value;
                      setData({ ...data, education: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx].institution = e.target.value;
                      setData({ ...data, education: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Duration / Years</label>
                  <input
                    type="text"
                    value={edu.duration}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx].duration = e.target.value;
                      setData({ ...data, education: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Grade / Classification (Optional)</label>
                  <input
                    type="text"
                    value={edu.grade || ""}
                    onChange={(e) => {
                      const next = [...data.education];
                      next[idx].grade = e.target.value;
                      setData({ ...data, education: next });
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. First Class Honours"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. PROJECTS (Work & Personal) */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {/* Work Projects */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0e0f17] border border-white/10 rounded-2xl p-4">
              <div>
                <h3 className="text-base font-semibold text-white">Work & Client Projects</h3>
                <p className="text-xs text-gray-400">
                  Featured under &quot;Work Projects&quot; on the ATS resume.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowImportModal("work")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/10 text-indigo-300 border border-indigo-500/20"
                >
                  <Database size={13} />
                  <span>Import from Portfolio</span>
                </button>
                <button
                  onClick={() => {
                    const newItem: CvProjectItem = {
                      name: "New Work Project",
                      technologies: "Next.js, Node.js, Docker",
                      description: "Enterprise system with automated CI/CD...",
                    };
                    setData({
                      ...data,
                      projects: {
                        ...data.projects,
                        work: [newItem, ...data.projects.work],
                      },
                    });
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {data.projects.work.map((proj, pIdx) => (
              <div
                key={pIdx}
                className="bg-[#0e0f17] border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    Work Project #{pIdx + 1}: {proj.name}
                  </span>
                  <button
                    onClick={() => {
                      const next = [...data.projects.work];
                      next.splice(pIdx, 1);
                      setData({
                        ...data,
                        projects: { ...data.projects, work: next },
                      });
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        const next = [...data.projects.work];
                        next[pIdx].name = e.target.value;
                        setData({
                          ...data,
                          projects: { ...data.projects, work: next },
                        });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => {
                        const next = [...data.projects.work];
                        next[pIdx].technologies = e.target.value;
                        setData({
                          ...data,
                          projects: { ...data.projects, work: next },
                        });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1">Description (ATS summary)</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const next = [...data.projects.work];
                        next[pIdx].description = e.target.value;
                        setData({
                          ...data,
                          projects: { ...data.projects, work: next },
                        });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Projects */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0e0f17] border border-white/10 rounded-2xl p-4">
              <div>
                <h3 className="text-base font-semibold text-white">Personal & Research Projects</h3>
                <p className="text-xs text-gray-400">
                  Featured under &quot;Personal Projects&quot; on the ATS resume.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowImportModal("personal")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/10 text-indigo-300 border border-indigo-500/20"
                >
                  <Database size={13} />
                  <span>Import from Portfolio</span>
                </button>
                <button
                  onClick={() => {
                    const newItem: CvProjectItem = {
                      name: "New Personal Project",
                      technologies: "React, TypeScript, Three.js",
                      description: "Interactive application demonstrating high performance...",
                    };
                    setData({
                      ...data,
                      projects: {
                        ...data.projects,
                        personal: [newItem, ...data.projects.personal],
                      },
                    });
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {data.projects.personal.map((proj, pIdx) => (
              <div
                key={pIdx}
                className="bg-[#0e0f17] border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    Personal Project #{pIdx + 1}: {proj.name}
                  </span>
                  <button
                    onClick={() => {
                      const next = [...data.projects.personal];
                      next.splice(pIdx, 1);
                      setData({
                        ...data,
                        projects: { ...data.projects, personal: next },
                      });
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        const next = [...data.projects.personal];
                        next[pIdx].name = e.target.value;
                        setData({
                          ...data,
                          projects: { ...data.projects, personal: next },
                        });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => {
                        const next = [...data.projects.personal];
                        next[pIdx].technologies = e.target.value;
                        setData({
                          ...data,
                          projects: { ...data.projects, personal: next },
                        });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const next = [...data.projects.personal];
                        next[pIdx].description = e.target.value;
                        setData({
                          ...data,
                          projects: { ...data.projects, personal: next },
                        });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SKILLS */}
      {activeTab === "skills" && (
        <div className="bg-[#0e0f17] border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Technical Skills Groups</h2>
              <p className="text-xs text-gray-400">
                Categorized skill competencies matched directly to ATS algorithms and job descriptions.
              </p>
            </div>
            <button
              onClick={() => {
                const categoryName = prompt("Enter new skill category name (e.g. AI & Machine Learning):");
                if (categoryName && !data.skills[categoryName]) {
                  setData({
                    ...data,
                    skills: { ...data.skills, [categoryName]: "Skill 1, Skill 2" },
                  });
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(data.skills).map(([category, skillString]) => (
              <div
                key={category}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">{category}</span>
                  <button
                    onClick={() => {
                      const next = { ...data.skills };
                      delete next[category];
                      setData({ ...data, skills: next });
                    }}
                    className="text-gray-400 hover:text-red-400 p-1"
                    title="Remove category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={skillString}
                  onChange={(e) =>
                    setData({
                      ...data,
                      skills: { ...data.skills, [category]: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PUBLICATIONS & ACTIVITIES */}
      {activeTab === "publications" && (
        <div className="space-y-6">
          {/* Publications */}
          <div className="bg-[#0e0f17] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Publications & Academic Contributions</h3>
                <p className="text-xs text-gray-400">Papers, conference presentations, and research achievements.</p>
              </div>
              <button
                onClick={() => {
                  const newPub: CvPublication = {
                    title: "Novel Publication Title",
                    detail: "International Conference on Software Engineering • 2024",
                  };
                  setData({
                    ...data,
                    publications: [...data.publications, newPub],
                  });
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Plus size={14} />
                <span>Add Publication</span>
              </button>
            </div>

            {data.publications.map((pub, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-indigo-400">Publication #{idx + 1}</span>
                  <button
                    onClick={() => {
                      const next = [...data.publications];
                      next.splice(idx, 1);
                      setData({ ...data, publications: next });
                    }}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <input
                  type="text"
                  value={pub.title}
                  onChange={(e) => {
                    const next = [...data.publications];
                    next[idx].title = e.target.value;
                    setData({ ...data, publications: next });
                  }}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Paper Title"
                />
                <input
                  type="text"
                  value={pub.detail}
                  onChange={(e) => {
                    const next = [...data.publications];
                    next[idx].detail = e.target.value;
                    setData({ ...data, publications: next });
                  }}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300"
                  placeholder="Venue & Date (e.g. ACM CHI • 2023)"
                />
              </div>
            ))}
          </div>

          {/* Activities */}
          <div className="bg-[#0e0f17] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Activities & Extracurriculars</h3>
                <p className="text-xs text-gray-400">Community leadership, open-source work, and hackathons.</p>
              </div>
              <button
                onClick={() => {
                  setData({
                    ...data,
                    activities: [...data.activities, "Active open-source contributor and technical mentor."],
                  });
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Plus size={14} />
                <span>Add Activity</span>
              </button>
            </div>

            {data.activities.map((act, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="text-gray-400">&bull;</span>
                <input
                  type="text"
                  value={act}
                  onChange={(e) => {
                    const next = [...data.activities];
                    next[idx] = e.target.value;
                    setData({ ...data, activities: next });
                  }}
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => {
                    const next = [...data.activities];
                    next.splice(idx, 1);
                    setData({ ...data, activities: next });
                  }}
                  className="text-gray-400 hover:text-red-400 p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. REFERENCES */}
      {activeTab === "references" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#0e0f17] border border-white/10 rounded-2xl p-4">
            <div>
              <h2 className="text-base font-semibold text-white">References (2-Column ATS Layout)</h2>
              <p className="text-xs text-gray-400">Professional or academic references.</p>
            </div>
            <button
              onClick={() => {
                const newRef: CvReference = {
                  name: "Reference Name",
                  title: "Department / Position",
                  phone: "+44 7000 000000",
                  email: "reference@example.com",
                };
                setData({ ...data, references: [...data.references, newRef] });
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus size={14} />
              <span>Add Reference</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.references.map((ref, idx) => (
              <div
                key={idx}
                className="bg-[#0e0f17] border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-indigo-400">Reference #{idx + 1}</span>
                  <button
                    onClick={() => {
                      const next = [...data.references];
                      next.splice(idx, 1);
                      setData({ ...data, references: next });
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => {
                        const next = [...data.references];
                        next[idx].name = e.target.value;
                        setData({ ...data, references: next });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Title / Organization</label>
                    <input
                      type="text"
                      value={ref.title}
                      onChange={(e) => {
                        const next = [...data.references];
                        next[idx].title = e.target.value;
                        setData({ ...data, references: next });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={ref.phone}
                      onChange={(e) => {
                        const next = [...data.references];
                        next[idx].phone = e.target.value;
                        setData({ ...data, references: next });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={ref.email}
                      onChange={(e) => {
                        const next = [...data.references];
                        next[idx].email = e.target.value;
                        setData({ ...data, references: next });
                      }}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. LIVE ATS PREVIEW */}
      {activeTab === "preview" && (
        <div className="bg-[#0e0f17] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Live ATS PDF & HTML Inspection</h2>
              <p className="text-xs text-gray-400">
                Inspect how ATS scrapers and hiring managers see your formatted resume.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="/resume.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/10 text-gray-300 border border-white/10"
              >
                <ExternalLink size={14} />
                <span>Open Clean HTML</span>
              </a>
              <a
                href="/api/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Download size={14} />
                <span>Open Clean PDF</span>
              </a>
            </div>
          </div>

          <div className="w-full h-[750px] rounded-xl overflow-hidden border border-white/10 bg-white">
            <iframe
              src="/resume.html"
              title="ATS Resume Preview"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* IMPORT FROM PORTFOLIO MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0f17] border border-white/15 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">
                  Import Project into {showImportModal === "work" ? "Work Projects" : "Personal Projects"}
                </h3>
                <p className="text-xs text-gray-400">
                  Select any published project from your database to insert it into your CV.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {availableProjects.length === 0 ? (
                <p className="text-xs text-gray-400">No published projects found in database.</p>
              ) : (
                availableProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.04] transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">{proj.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          {proj.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {proj.description || proj.summary}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5 font-mono">
                        {proj.technologies.join(" &bull; ")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleImportProject(proj, showImportModal)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 mt-1"
                    >
                      Import
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowImportModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
