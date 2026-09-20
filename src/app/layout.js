import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "Shiv Pooja Residency | Real Estate CRM Authentication",
  description:
    "Secure Login and Password Management Portal for Shiv Pooja Residency Real Estate CRM.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-brand-surface text-brand-text">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

