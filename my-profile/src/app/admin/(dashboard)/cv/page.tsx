import { requireAdmin } from "@/lib/auth-guard";
import { getCvData } from "@/lib/cv-service";
import { getAvailableProjectsForCv } from "@/actions/cv";
import CvManagerClient from "@/components/admin/CvManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CV & ATS Resume Studio | Admin",
  description: "Manage, customize, and compile ATS-friendly Resume PDF and HTML",
};

export default async function AdminCvPage() {
  await requireAdmin();

  const [cvData, availableProjects] = await Promise.all([
    getCvData(),
    getAvailableProjectsForCv(),
  ]);

  return (
    <div className="space-y-6">
      <CvManagerClient
        initialData={cvData}
        availableProjects={availableProjects}
      />
    </div>
  );
}
