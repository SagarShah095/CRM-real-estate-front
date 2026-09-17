import ForgotPasswordPage from "@/components/auth/ForgotPasswordPage";

export const metadata = {
  title: "Forgot Password | Shiv Pooja Residency CRM",
  description:
    "Request a password reset link or security code for your CRM account.",
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-brand-surface flex flex-col justify-center py-8 relative">
      <ForgotPasswordPage />
    </main>
  );
}
