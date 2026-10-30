"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck2,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Trash2,
} from "lucide-react";
import { ResumeStatus, switchResumeModeAction, deleteCustomResumeAction } from "@/actions/cv";
import { useRouter } from "next/navigation";

interface CustomCvUploaderProps {
  initialStatus: ResumeStatus;
}

export default function CustomCvUploader({ initialStatus }: CustomCvUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ResumeStatus>(initialStatus);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showMsg("error", "Please upload a valid PDF file.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showMsg("error", "File is too large. Max size is 25MB.");
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          mode: "custom",
          fileName: data.fileName,
          fileSize: data.fileSize,
          uploadedAt: data.uploadedAt,
          customFileExists: true,
          liveFileExists: true,
        });
        showMsg("success", "Your custom CV has been uploaded and is now LIVE on the site!");
        router.refresh();
      } else {
        showMsg("error", data.error || "Failed to upload CV.");
      }
    } catch {
      showMsg("error", "Network error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleModeSwitch = async (newMode: "custom" | "generated") => {
    if (newMode === status.mode) return;
    setIsSwitching(true);
    try {
      const res = await switchResumeModeAction(newMode);
      if (res.success) {
        setStatus((prev) => ({ ...prev, mode: newMode }));
        showMsg(
          "success",
          newMode === "custom"
            ? "Switched to Custom Uploaded CV!"
            : "Switched to Auto-Generated ATS Engine!"
        );
        router.refresh();
      } else {
        showMsg("error", res.error || "Failed to switch mode.");
      }
    } catch {
      showMsg("error", "Error switching mode.");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your custom CV? The site will revert to the generated ATS resume.")) {
      return;
    }
    setIsSwitching(true);
    try {
      const res = await deleteCustomResumeAction();
      if (res.success) {
        setStatus({
          mode: "generated",
          fileName: null,
          fileSize: null,
          uploadedAt: null,
          customFileExists: false,
          liveFileExists: true,
        });
        showMsg("success", "Custom CV removed. Now serving auto-generated ATS resume.");
        router.refresh();
      } else {
        showMsg("error", res.error || "Failed to delete.");
      }
    } catch {
      showMsg("error", "Error deleting custom CV.");
    } finally {
      setIsSwitching(false);
    }
  };

  const formattedDate = status.uploadedAt
    ? new Date(status.uploadedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-[#08090f]/90 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
      {/* Decorative accent glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Source Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={16} />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              CV Source & Document Manager
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Choose whether to serve your own custom designed PDF (Canva, Figma, LaTeX, Word) or the script-generated ATS format.
          </p>
        </div>

        {/* Mode Selector Pills */}
        <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleModeSwitch("custom")}
            disabled={isSwitching || !status.customFileExists}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status.mode === "custom"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-white disabled:opacity-40"
            }`}
          >
            <FileText size={13} />
            <span>Custom PDF</span>
            {status.mode === "custom" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch("generated")}
            disabled={isSwitching}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status.mode === "generated"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <RefreshCw size={13} className={isSwitching ? "animate-spin" : ""} />
            <span>Script Generator</span>
            {status.mode === "generated" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`flex items-center space-x-2.5 p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/40 border-red-500/30 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Current File Information Card */}
      {status.customFileExists && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
              <FileCheck2 size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">
                  {status.fileName || "custom_resume.pdf"}
                </span>
                {status.mode === "custom" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live On Site
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-400">
                    Saved (Inactive)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                {status.fileSize && (
                  <span className="flex items-center space-x-1">
                    <HardDrive size={12} className="text-gray-500" />
                    <span>{status.fileSize}</span>
                  </span>
                )}
                {formattedDate && (
                  <span className="flex items-center space-x-1">
                    <Clock size={12} className="text-gray-500" />
                    <span>Uploaded {formattedDate}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <a
              href="/api/resume"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 border border-white/10 transition-all"
            >
              <ExternalLink size={13} />
              <span>Preview</span>
            </a>

            <a
              href="/api/resume"
              download
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 border border-white/10 transition-all"
            >
              <Download size={13} />
              <span>Download</span>
            </a>

            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              title="Delete Custom CV"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
            : "border-white/15 bg-white/[0.02] hover:border-indigo-500/40 hover:bg-white/[0.04]"
        } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {isUploading ? (
              <RefreshCw size={24} className="animate-spin text-indigo-400" />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {isUploading ? (
                "Uploading and publishing CV..."
              ) : status.customFileExists ? (
                <>
                  Click or drag to <span className="text-indigo-400">replace your CV</span> with a new PDF
                </>
              ) : (
                <>
                  Click to browse or <span className="text-indigo-400">drag & drop your CV (PDF)</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports any PDF exported from Canva, Figma, Word, or LaTeX • Max file size: 25MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

