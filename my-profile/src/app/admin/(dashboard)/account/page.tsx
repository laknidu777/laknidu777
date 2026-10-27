import { redirect } from "next/navigation";
import { getAdminAccountDetails } from "@/actions/auth-credentials";
import AccountCredentialsManager from "@/components/admin/AccountCredentialsManager";

export default async function AdminAccountPage() {
  const user = await getAdminAccountDetails();

  if (!user) {
    redirect("/admin/login");
  }

  return <AccountCredentialsManager user={user} />;
}
