import { Suspense } from "react";
import AdminTasksView from "@/components/admin/AdminTasksView";

export const metadata = {
  title: "Tasks Management | RealtyCRM Enterprise",
  description: "Manage client follow-ups, scheduled calls, site visits, and team tasks.",
};

export default function AdminTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl p-12 text-center text-sm font-semibold text-slate-400">
          Loading Tasks...
        </div>
      }
    >
      <AdminTasksView />
    </Suspense>
  );
}
