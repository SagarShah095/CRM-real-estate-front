import AdminModulePlaceholderView from "@/components/admin/AdminModulePlaceholderView";

export const metadata = {
  title: "Property Inventory | RealtyCRM Enterprise",
  description: "Unit inventory, floor plans, pricing sheets, and availability across real estate towers.",
};

export default function PropertyPage() {
  return (
    <AdminModulePlaceholderView
      title="Property Inventory"
      category="CRM / Inventory"
      subtitle="Track available units, reserved flats, commercial plots, and blocked listings."
      actionLabel="+ Add Unit"
      metrics={[
        { label: "Total Units", value: "480", change: "Across 4 Towers", isPositive: true },
        { label: "Available to Sell", value: "142", change: "Ready Units", isPositive: true },
        { label: "Booked / Token", value: "318", change: "Sold Out 66%", isPositive: true },
        { label: "Average Rate", value: "₹6,850/sq.ft", change: "+4.5%", isPositive: true },
      ]}
    />
  );
}
