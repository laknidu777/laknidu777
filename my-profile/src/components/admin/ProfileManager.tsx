"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { ProfileSettingsInput, profileSettingsSchema } from "@/lib/validations";
import { updateProfileSettings } from "@/actions/settings";

interface ProfileManagerProps {
  initialSettings: Record<string, string>;
}

export default function ProfileManager({ initialSettings }: ProfileManagerProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ProfileSettingsInput>({
    profile_name: initialSettings["profile_name"] || "Laknidu Thilakawardhana",
    profile_headline:
      initialSettings["profile_headline"] ||
      "Software Engineer, Researcher, and Builder of interactive web experiences.",
    profile_bio:
      initialSettings["profile_bio"] ||
      "Bridging the gap between design and deep technical engineering. Passionate about AI, Open Source, and crafting digital products that feel alive.",
    profile_about_p1:
      initialSettings["profile_about_p1"] ||
      "I am a Software Engineer and Researcher with a passion for building scalable web applications and exploring the intersection of design, interaction, and deep technical engineering.",
    profile_about_p2:
      initialSettings["profile_about_p2"] ||
      "My approach to solving problems involves a healthy mix of rigorous academic research, rapid prototyping, and a relentless focus on the end-user experience. I believe that the best products are not just functional, but delightfully interactive and meticulously crafted.",
    profile_about_p3:
      initialSettings["profile_about_p3"] ||
      "When I'm not writing code for web platforms or optimizing backend services, you can find me tinkering with game engines, contributing to open-source developer tools, or reading up on the latest advancements in artificial intelligence and human-computer interaction.",
    profile_location: initialSettings["profile_location"] || "United Kingdom",
    profile_resume_url: initialSettings["profile_resume_url"] || "/resume.pdf",
    profile_availability:
      initialSettings["profile_availability"] || "Available for freelance opportunities",
  });

  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    const parsed = profileSettingsSchema.safeParse(formData);
    if (!parsed.success) {
      setNotice({
        type: "error",
        text: parsed.error.issues[0]?.message || "Validation failed",
      });
      return;
    }

    startTransition(async () => {
      const res = await updateProfileSettings(formData);
      if (res.success) {
        setNotice({ type: "success", text: "Profile settings saved successfully!" });
        router.refresh();
        setTimeout(() => setNotice(null), 3000);
      } else {
        setNotice({ type: "error", text: res.error || "Failed to update profile settings" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm transition-all ${
            notice.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs uppercase tracking-wider font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile Information</h1>
          <p className="text-sm text-gray-400 mt-1">
            Update your public persona, headline, bio paragraphs, and resume link
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 self-start sm:self-auto"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>Save Profile</span>
        </button>
      </div>

      {/* Basic Profile Details */}
      <div className="bg-[#0b0c13] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <User size={16} />
          <span>Core Profile Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Full Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.profile_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, profile_name: e.target.value }))}
              placeholder="e.g. Laknidu Thilakawardhana"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Location / City
            </label>
            <input
              type="text"
              value={formData.profile_location || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, profile_location: e.target.value }))
              }
              placeholder="e.g. United Kingdom"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Professional Headline *
          </label>
          <input
            type="text"
            required
            value={formData.profile_headline}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, profile_headline: e.target.value }))
            }
            placeholder="e.g. Software Engineer, Researcher, and Builder of interactive web experiences."
            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Hero Introduction Bio *
          </label>
          <textarea
            required
            rows={3}
            value={formData.profile_bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, profile_bio: e.target.value }))}
            placeholder="Concise high-impact bio displayed prominently in the hero section..."
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Resume URL or File Path
              </label>
              <a
                href="/admin/cv"
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Upload Custom PDF →
              </a>
            </div>
            <input
              type="text"
              value={formData.profile_resume_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, profile_resume_url: e.target.value }))
              }
              placeholder="/api/resume or /resume.pdf"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Availability Badge Status
            </label>
            <input
              type="text"
              value={formData.profile_availability || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, profile_availability: e.target.value }))
              }
              placeholder="e.g. Available for freelance opportunities"
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* About Section In-depth Content */}
      <div className="bg-[#0b0c13] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <User size={16} />
          <span>About Me Narrative</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            About Section &mdash; Paragraph 1
          </label>
          <textarea
            rows={3}
            value={formData.profile_about_p1 || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, profile_about_p1: e.target.value }))
            }
            placeholder="Introduction to your background and core focus..."
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            About Section &mdash; Paragraph 2
          </label>
          <textarea
            rows={3}
            value={formData.profile_about_p2 || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, profile_about_p2: e.target.value }))
            }
            placeholder="Your methodology, research approach, or engineering philosophy..."
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            About Section &mdash; Paragraph 3
          </label>
          <textarea
            rows={3}
            value={formData.profile_about_p3 || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, profile_about_p3: e.target.value }))
            }
            placeholder="Personal interests, game development hobbies, or open source involvement..."
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>
      </div>
    </form>
  );
}
