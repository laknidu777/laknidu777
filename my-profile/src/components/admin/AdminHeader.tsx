"use client";

import { Menu, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { handleSignOut } from "@/actions/auth";
import { useTransition } from "react";
import Link from "next/link";

interface AdminHeaderProps {
  onMobileOpen: () => void;
  title?: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminHeader({ onMobileOpen, title = "Admin CMS", user }: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const onLogout = () => {
    startTransition(async () => {
      await handleSignOut();
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0b10]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMobileOpen}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <ExternalLink size={13} />
          <span>View Site</span>
        </Link>

        {/* User Pill */}
        <div className="flex items-center space-x-3 pl-3 sm:border-l sm:border-white/10">
          <Link
            href="/admin/account"
            className="flex items-center space-x-3 group hover:opacity-90 transition-opacity"
            title="Manage Admin Credentials & Password"
          >
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-white group-hover:text-indigo-300 leading-none mb-1 transition-colors">
                {user?.name || "Administrator"}
              </span>
              <div className="flex items-center justify-end space-x-1">
                <ShieldCheck size={11} className="text-indigo-400" />
                <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">
                  ADMIN
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner group-hover:ring-2 group-hover:ring-indigo-400/50 transition-all">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            disabled={isPending}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
            title="Log out of Admin"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
