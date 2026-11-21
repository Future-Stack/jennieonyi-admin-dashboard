import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <AdminLayout>{children}</AdminLayout>
    </AdminProviders>
  );
}
