import { Suspense } from "react";
import AdminUsersView from "@/components/admin/AdminUsersView";

export const metadata = {
  title: "Users & Teams | RealtyCRM Enterprise",
  description: "Manage system users, designations, sales teams, and agent credentials.",
};

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl p-12 text-center text-sm font-semibold text-slate-400">
          Loading Users & Teams...
        </div>
      }
    >
      <AdminUsersView />
    </Suspense>
  );
}
