import Head from "next/head";
import { StaffShell } from "@/components/layouts/StaffShell";
import { useAuth } from "@/providers/AuthProvider";
import { AdminDashboard } from "@/modules/analytics/components/AdminDashboard";
import { ProductManagerDashboard } from "@/modules/analytics/components/ProductManagerDashboard";
import { SupportDashboard } from "@/modules/analytics/components/SupportDashboard";

export default function StaffDashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "PRODUCT_MANAGER":
        return <ProductManagerDashboard />;
      case "CUSTOMER_SUPPORT":
        return <SupportDashboard />;
      default:
        return (
          <div className="glass p-5">
            <p className="text-sm text-rose-600">
              No dashboard available for your role.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard — Voltra Staff</title>
      </Head>
      <StaffShell>
        {renderDashboard()}
      </StaffShell>
    </>
  );
}
