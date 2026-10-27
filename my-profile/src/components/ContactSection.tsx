"use client";

import { useState } from "react";
import SectionLayout from "./SectionLayout";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Github, Linkedin, Twitter } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";
import { submitContactInquiry } from "@/actions/contact";

interface ContactSectionProps {
  contact?: {
    email: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    title?: string;
    description?: string;
  };
}

export default function ContactSection({ contact }: ContactSectionProps) {
  const email = contact?.email || "hello@example.com";
  const github = contact?.github || "#";
  const linkedin = contact?.linkedin || "#";
  const twitter = contact?.twitter || "#";
  const title = contact?.title || "Let's build something amazing together.";
  const description =
    contact?.description ||
    "Whether you have a freelance project, a research opportunity, or just want to say hi, my inbox is always open. I'll try my best to get back to you!";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus("error");
      setFeedback("Please fill out all required fields.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const response = await submitContactInquiry(formData);

      if (response.success) {
        setStatus("success");
        setFeedback(response.message || "Your message has been sent successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          honeypot: "",
        });
      } else {
        setStatus("error");
        setFeedback(response.error || "Failed to deliver message. Please reach out directly via email.");
      }
    } catch (err: unknown) {
      console.error("[Contact Form Submit Error]", err);
      setStatus("error");
      setFeedback("An unexpected error occurred while sending your message. Please try again or email directly.");
    }
  };

  return (
    <SectionLayout id="contact" title="Get In Touch">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Direct info & social links */}
        <div>
          <h3 className="text-2xl font-semibold text-white mb-6">{title}</h3>
          <p className="text-gray-400 mb-8 leading-relaxed text-lg">{description}</p>

          <div className="space-y-6">
            <a
              href={`mailto:${email}`}
              className="flex items-center space-x-4 text-gray-300 hover:text-indigo-400 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-lg">{email}</span>
            </a>

            <div className="flex items-center space-x-4 pt-4">
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-sky-400 hover:bg-sky-500/20 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="relative">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Honeypot field (hidden from legitimate users, traps spam bots) */}
            <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-400">
                  Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={status === "submitting"}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-colors disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-400">
                  Email <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={status === "submitting"}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-colors disabled:opacity-50"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-gray-400">
                Subject <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                disabled={status === "submitting"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-colors disabled:opacity-50"
                placeholder="Freelance Project Inquiry"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-400">
                Message <span className="text-indigo-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                disabled={status === "submitting"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white transition-colors resize-none disabled:opacity-50"
                placeholder="Tell me about your project, timeline, or idea..."
              />
            </div>

            {/* Submission feedback alerts */}
            <AnimatePresence mode="wait">
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start space-x-3 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-200">Message Delivered!</p>
                    <p className="text-emerald-300/90 text-xs mt-0.5">{feedback}</p>
                  </div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-200">Could Not Send</p>
                    <p className="text-rose-300/90 text-xs mt-0.5">{feedback}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={status === "submitting"}
              whileHover={{ scale: status === "submitting" ? 1 : 1.01 }}
              whileTap={{ scale: status === "submitting" ? 1 : 0.99 }}
              className={`w-full py-4 font-semibold rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
                status === "submitting"
                  ? "bg-indigo-600/60 text-white/70 cursor-not-allowed"
                  : status === "success"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25"
              }`}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending message...</span>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Send Another Message</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Responses are delivered directly to your inbox with a verified reply channel.
            </p>
          </form>
        </div>
      </div>
    </SectionLayout>
  );
}
