import ResetPasswordPage from "@/components/ResetPasswordPage";
import ThemeColorPicker from "@/components/ThemeColorPicker";

export const metadata = {
  title: "Reset Password | Shiv Pooja Residency CRM",
  description: "Reset your Shiv Pooja Residency CRM password securely.",
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-brand-surface flex flex-col justify-center py-8 relative">
      <ResetPasswordPage />
      <ThemeColorPicker />
    </main>
  );
}
