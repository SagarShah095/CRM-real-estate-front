import LoginPage from "@/components/LoginPage";

export const metadata = {
  title: "Sign In | Shiv Pooja Residency CRM",
  description: "Secure login portal for Shiv Pooja Residency Real Estate CRM.",
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-brand-surface flex flex-col justify-center py-8 relative">
      <LoginPage />
    </main>
  );
}

