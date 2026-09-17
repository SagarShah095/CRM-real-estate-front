import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Shiv Pooja Residency | Real Estate CRM Authentication",
  description: "Secure Login and Password Management Portal for Shiv Pooja Residency Real Estate CRM.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-brand-surface text-brand-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

