import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Admin Portal | RealtyCRM Enterprise",
  description: "Enterprise administration dashboard, team management, and CRM portal.",
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
