import { Suspense } from "react";
import AdminLeadsView from "@/components/admin/AdminLeadsView";

export const metadata = {
  title: "CRM Leads | RealtyCRM Enterprise",
  description: "Track sales inquiries, prospect pipelines, status stages, and agent assignments.",
};

export default function AdminLeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl p-12 text-center text-sm font-semibold text-slate-400">
          Loading Leads...
        </div>
      }
    >
      <AdminLeadsView />
    </Suspense>
  );
}
