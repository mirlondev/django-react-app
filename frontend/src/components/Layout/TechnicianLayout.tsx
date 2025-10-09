import { ReactNode } from "react";
import AppLayout from "./AppLayout";
import React from "react";
import AuthenticatedLayout from "../Auth/AuthenticatedLayout";

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedLayout>
      <div className="bg-white  m-4  dark:bg-gray-800 dark:text-white rounded-xl shadow p-4">
        <h1 className="text-xl font-semibold mb-4">Espace Technicien</h1>
        {children}
      </div>
    </AuthenticatedLayout>
  );
}
