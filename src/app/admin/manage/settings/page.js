import AdminModulePlaceholderView from "@/components/admin/AdminModulePlaceholderView";

export const metadata = {
  title: "Admin Settings | RealtyCRM Enterprise",
  description: "Company profile, branch setup, RERA parameters, WhatsApp API, and access control.",
};

export default function SettingsPage() {
  return (
    <AdminModulePlaceholderView
      title="System & Tenant Settings"
      category="Manage / Configuration"
      subtitle="Configure corporate entity details, WhatsApp Business API, automated SMS, and call masking."
      actionLabel="+ Add Configuration"
      metrics={[
        { label: "Security Policies", value: "2FA On", change: "Enforced", isPositive: true },
        { label: "API Integrations", value: "6 Active", change: "Synced", isPositive: true },
        { label: "WhatsApp Gateway", value: "Connected", change: "99.9% uptime", isPositive: true },
        { label: "Audit Logs", value: "3,410", change: "Recorded", isPositive: true },
      ]}
    />
  );
}
