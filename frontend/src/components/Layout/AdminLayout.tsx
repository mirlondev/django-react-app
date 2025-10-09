// layouts/AdminLayout.tsx
import { ReactNode } from "react";
import AuthenticatedLayout from "../Auth/AuthenticatedLayout";
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout >
      {children}
    </AuthenticatedLayout>
  );
}
