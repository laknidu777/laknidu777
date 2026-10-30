import { requireAdmin } from "@/lib/auth-guard";
import { getCvData } from "@/lib/cv-service";
import { getAvailableProjectsForCv, getResumeStatusAction } from "@/actions/cv";
import CvManagerClient from "@/components/admin/CvManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CV & ATS Resume Studio | Admin",
  description: "Manage, customize, and upload custom Resume PDF or compile ATS-friendly Resume",
};

export default async function AdminCvPage() {
  await requireAdmin();

  const [cvData, availableProjects, resumeStatus] = await Promise.all([
    getCvData(),
    getAvailableProjectsForCv(),
    getResumeStatusAction(),
  ]);

  return (
    <div className="space-y-6">
      <CvManagerClient
        initialData={cvData}
        availableProjects={availableProjects}
        initialResumeStatus={resumeStatus}
      />
    </div>
  );
}
