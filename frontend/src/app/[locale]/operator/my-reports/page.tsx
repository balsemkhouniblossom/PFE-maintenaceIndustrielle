"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useTranslations } from "next-intl";

type EntityRef = string | { _id?: string };

interface WorkOrder {
  _id: string;
  ot_id: string;
  type_maintenance?: string;
  status: string;
  machine_id?: { machine_id?: string } | string;
  date_created?: string;
}

interface InterventionReport {
  _id: string;
  report_id: string;
  ot_id: EntityRef;
  technician_id: EntityRef;
  description_action?: string;
  etat_final?: string;
  validation_responsable?: string;
  date_debut?: string;
  date_fin?: string;
}

function refId(value: EntityRef | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id ?? "";
}

export default function OperatorMyReportsPage() {
  const t = useTranslations("dashboard.operator");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<InterventionReport[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  function showNotification(type: "success" | "error" | "info", message: string): void {
    setNotification({ type, message });
    window.setTimeout(() => setNotification(null), 4000);
  }

  function handleStatusFilterChange(value: string): void {
    setStatusFilter(value);
    showNotification("info", t("notifications.filterUpdated"));
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [reportsRes, workOrdersRes] = await Promise.all([
          apiService.getInterventionReports(),
          apiService.getWorkOrders(),
        ]);

        setReports(reportsRes.data ?? []);
        setWorkOrders(workOrdersRes.data ?? []);
        showNotification("success", t("notifications.dataLoaded"));
      } catch (error) {
        console.error("Failed to load my reports", error);
        showNotification("error", t("notifications.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const myReports = useMemo(() => {
    if (!user?._id) return [];

    const filtered = reports.filter((report) => refId(report.technician_id) === user._id);

    return filtered
      .map((report) => {
        const workOrderId = refId(report.ot_id);
        const workOrder = workOrders.find((item) => item._id === workOrderId);
        return { report, workOrder };
      })
      .filter((item) => (statusFilter === "all" ? true : item.workOrder?.status === statusFilter));
  }, [reports, statusFilter, user?._id, workOrders]);

  return (
    <ProtectedRoute requiredRole="operator">
      <DashboardLayout title={t("myReports")}>
        {notification ? (
          <div
            data-testid="my-reports-notification"
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : notification.type === "error"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            {notification.message}
          </div>
        ) : null}
        <div className="bento-grid">
          <div className="col-span-full panel">
            <div className="card-title mb-4">{t("myReports")}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="panel">
                <div className="text-sm text-slate-500">{t("report")}</div>
                <div className="text-2xl font-bold">{myReports.length}</div>
              </div>
              <div className="panel">
                <div className="text-sm text-slate-500">{t("waitingValidation")}</div>
                <div className="text-2xl font-bold">{myReports.filter((item) => item.workOrder?.status === "waiting_validation").length}</div>
              </div>
              <div className="panel">
                <div className="text-sm text-slate-500">{t("completed")}</div>
                <div className="text-2xl font-bold">{myReports.filter((item) => item.workOrder?.status === "completed").length}</div>
              </div>
              <div>
                <label className="block text-sm mb-2">{t("validation")}</label>
                <select
                  value={statusFilter}
                  onChange={(event) => handleStatusFilterChange(event.target.value)}
                  data-testid="my-reports-status-filter"
                  className="w-full border rounded-lg px-3 py-2"
                  title={t("validation")}
                  aria-label={t("validation")}
                >
                  <option value="all">{t("all")}</option>
                  <option value="waiting_validation">{t("waitingValidation")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="returned">{t("returned")}</option>
                  <option value="technician_required">{t("technicianRequired")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-span-full panel">
            {loading ? (
              <div className="text-sm text-slate-500">{tCommon("loading")}</div>
            ) : myReports.length === 0 ? (
              <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReports.map(({ report, workOrder }, index) => (
                  <div key={report._id} className="border rounded-xl p-4" data-testid={`my-report-card-${index}`}>
                    <div className="font-semibold">{report.report_id}</div>
                    <div className="text-sm text-slate-500">{t("workOrder")}: {workOrder?.ot_id ?? tCommon("notAvailable")}</div>
                    <div className="text-sm mt-2">{report.description_action || tCommon("notAvailable")}</div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                      <div>{t("report")}: {workOrder?.type_maintenance === "preventive" ? t("preventive") : t("corrective")}</div>
                      <div>{t("validation")}: {workOrder?.status ?? tCommon("notAvailable")}</div>
                      <div>{t("machine")}: {typeof workOrder?.machine_id === "string" ? workOrder.machine_id : (workOrder?.machine_id?.machine_id ?? "-")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
