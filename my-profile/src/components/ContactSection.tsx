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
      </div>
    </SectionLayout>
  );
}
