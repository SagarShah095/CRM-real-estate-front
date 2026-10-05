import AdminModulePlaceholderView from "@/components/admin/AdminModulePlaceholderView";

export const metadata = {
  title: "Accounts & Financials | RealtyCRM Enterprise",
  description: "Installment schedules, demand notes, GST invoicing, collections, and broker payouts.",
};

export default function AccountsPage() {
  return (
    <AdminModulePlaceholderView
      title="Accounts & Billing"
      category="Finance & Invoicing"
      subtitle="Issue customer demand letters, track bank reconciliations, GST invoices, and vendor vouchers."
      actionLabel="+ Create Demand Note"
      metrics={[
        { label: "Due Collections", value: "₹4.6 Cr", change: "This Quarter", isPositive: false },
        { label: "Realized Today", value: "₹42.5 L", change: "NEFT/RTGS", isPositive: true },
        { label: "Overdue Installments", value: "11", change: "Notice Sent", isPositive: false },
        { label: "GST Remittance", value: "₹38.2 L", change: "Filing Ready", isPositive: true },
      ]}
    />
  );
}
