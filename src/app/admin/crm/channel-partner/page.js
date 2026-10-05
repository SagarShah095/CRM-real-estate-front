import AdminModulePlaceholderView from "@/components/admin/AdminModulePlaceholderView";

export const metadata = {
  title: "Channel Partners | RealtyCRM Enterprise",
  description: "Manage broker networks, Channel Partner onboardings, commissions, and RERA certifications.",
};

export default function ChannelPartnerPage() {
  return (
    <AdminModulePlaceholderView
      title="Channel Partner"
      category="CRM / Channel Network"
      subtitle="Onboard and manage real estate broker alliances, commission structures, and agency tiers."
      actionLabel="+ Register Partner"
      metrics={[
        { label: "Total Partners", value: "86", change: "+8 this month", isPositive: true },
        { label: "Active Brokers", value: "64", change: "RERA Verified", isPositive: true },
        { label: "Pending Approvals", value: "14", change: "Docs Required", isPositive: false },
        { label: "Total Disbursed", value: "₹24.8 L", change: "Brokerage", isPositive: true },
      ]}
    />
  );
}
