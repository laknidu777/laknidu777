"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FolderGit2,
  BookOpen,
  Gamepad2,
  Layers,
  Award,
  Sparkles,
  User,
  Mail,
  Settings,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navSections = [
  {
    title: "Main",
    items: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Projects & Work",
    items: [
      { name: "All Projects", href: "/admin/projects", icon: Layers },
      { name: "Freelance", href: "/admin/freelance", icon: Briefcase },
      { name: "Personal Projects", href: "/admin/personal", icon: FolderGit2 },
      { name: "Research", href: "/admin/research", icon: BookOpen },
      { name: "Games", href: "/admin/games", icon: Gamepad2 },
    ],
  },
  {
    title: "Resume & Credentials",
    items: [
      { name: "Experience", href: "/admin/experience", icon: Award },
      { name: "Skills", href: "/admin/skills", icon: Sparkles },
      { name: "CV / ATS Resume", href: "/admin/cv", icon: FileText },
    ],
  },
  {
    title: "Portfolio Settings",
    items: [
      { name: "Profile", href: "/admin/profile", icon: User },
      { name: "Contact & Social", href: "/admin/contact", icon: Mail },
      { name: "Site Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0a0b10] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0d0e15]/50">
          <Link href="/admin" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              CMS
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight block text-sm">Portfolio Admin</span>
              <span className="text-[11px] text-gray-400 font-mono">v1.0 &bull; Content Studio</span>
            </div>
          </Link>

          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50"
                        : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        size={18}
                        className={`transition-colors ${
                          active
                            ? "text-indigo-400"
                            : "text-gray-400 group-hover:text-gray-200"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {active ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="opacity-0 group-hover:opacity-40 transition-opacity"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info & view public link */}
        <div className="p-4 border-t border-white/10 bg-[#0d0e15]/40 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/5 transition-all"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink size={14} className="text-indigo-400" />
              <span>View Public Portfolio</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">Live</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
