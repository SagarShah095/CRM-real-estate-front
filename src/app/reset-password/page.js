import { Suspense } from "react";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const metadata = {
  title: "Reset Password | Shiv Pooja Residency CRM",
  description: "Reset your Shiv Pooja Residency CRM password securely.",
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-brand-surface flex flex-col justify-center py-8 relative">
      <Suspense fallback={<div className="text-center text-sm text-gray-500 py-10">Loading password reset form...</div>}>
        <ResetPasswordPage />
      </Suspense>
    </main>
  );
}


