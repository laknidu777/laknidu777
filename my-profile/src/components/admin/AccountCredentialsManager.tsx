"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { updateAdminCredentials } from "@/actions/auth-credentials";

interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountCredentialsManagerProps {
  user: AccountUser;
}

export default function AccountCredentialsManager({ user }: AccountCredentialsManagerProps) {
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    startTransition(async () => {
      const res = await updateAdminCredentials({ name, email });
      if (res.success) {
        setNotice({ type: "success", text: res.message || "Profile details updated!" });
        router.refresh();
      } else {
        setNotice({ type: "error", text: res.error || "Update failed." });
      }
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!currentPassword) {
      setNotice({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (newPassword.length < 8) {
      setNotice({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", text: "New passwords do not match." });
      return;
    }

    startTransition(async () => {
      const res = await updateAdminCredentials({ currentPassword, newPassword });
      if (res.success) {
        setNotice({ type: "success", text: res.message || "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setNotice({ type: "error", text: res.error || "Failed to update password." });
      }
    });
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(user.createdAt));

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Account & Credentials Security
            </h1>
            <p className="text-sm text-gray-400">
              Manage your administrator credentials, email address, and login password
            </p>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-start space-x-3 text-sm transition-all ${
            notice.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-rose-400" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Account Overview Hero Card */}
      <div className="bg-[#0b0c13]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-500/20">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center space-x-1">
                <ShieldCheck size={11} className="mr-1 text-indigo-400" />
                {user.role}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex items-center space-x-1.5">
              <Mail size={14} className="text-gray-500" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
          <Clock size={14} />
          <span>Member since {formattedDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Update Name & Email */}
        <div className="bg-[#0b0c13]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-semibold mb-4">
              <User size={18} className="text-indigo-400" />
              <h3>Admin Identity</h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Update the name and primary email address used for admin authentication and recovery.
            </p>

            <form onSubmit={handleUpdateProfile} id="profile-form" className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Login Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  This address is where OTP password recovery codes are dispatched.
                </p>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10">
            <button
              type="submit"
              form="profile-form"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              <span>Save Admin Info</span>
            </button>
          </div>
        </div>

        {/* Section 2: Change Password */}
        <div className="bg-[#0b0c13]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-semibold mb-4">
              <Lock size={18} className="text-purple-400" />
              <h3>Change Password</h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Strengthen your account security by updating your admin password.
            </p>

            <form onSubmit={handleUpdatePassword} id="password-form" className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password indicator */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      newPassword.length >= 8 ? "bg-emerald-400" : "bg-gray-600"
                    }`}
                  />
                  <span className={newPassword.length >= 8 ? "text-emerald-300" : ""}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      newPassword && newPassword === confirmPassword
                        ? "bg-emerald-400"
                        : "bg-gray-600"
                    }`}
                  />
                  <span
                    className={
                      newPassword && newPassword === confirmPassword ? "text-emerald-300" : ""
                    }
                  >
                    Passwords match
                  </span>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10">
            <button
              type="submit"
              form="password-form"
              disabled={isPending || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Lock size={14} />
              <span>Update Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
