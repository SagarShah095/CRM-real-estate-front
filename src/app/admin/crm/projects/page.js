import { Suspense } from "react";
import AdminProjectsView from "@/components/admin/AdminProjectsView";

export const metadata = {
  title: "Projects | RealtyCRM Enterprise",
  description: "Real estate construction projects, launch phases, site progress, and brochures.",
};

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl p-12 text-center text-sm font-semibold text-slate-400">
          Loading Projects...
        </div>
      }
    >
      <AdminProjectsView />
    </Suspense>
  );
}
