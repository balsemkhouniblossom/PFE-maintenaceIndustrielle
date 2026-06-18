"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useTranslations } from "next-intl";

export default function TechnicianDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const tTech = useTranslations("dashboard.technician");

  return (
    <ProtectedRoute requiredRole="technician">
      <DashboardLayout title={tTech("title")}> 
        <div className="bento-grid">
          <div className="col-span-full mb-6 bento-item">
            <div className="panel">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {tTech("title")}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {tTech("description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-item panel">
            <div className="card-title">Work Orders</div>
            <p className="text-slate-600">Technician widgets coming soon.</p>
          </div>

          <div className="bento-item panel">
            <div className="card-title">Machines</div>
            <p className="text-slate-600">Technician widgets coming soon.</p>
          </div>

          <div className="bento-item panel">
            <div className="card-title">Sensors</div>
            <p className="text-slate-600">Technician widgets coming soon.</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

