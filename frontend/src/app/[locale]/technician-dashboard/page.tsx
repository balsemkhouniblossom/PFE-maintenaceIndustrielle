"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { apiService } from "@/services/api";
import { useTranslations } from "next-intl";

interface WorkOrder {
  _id: string;
  ot_id: string;
  description?: string;
  status: string;
  type_maintenance?: string;
  machine_id?: { _id?: string; machine_id?: string } | string;
  date_created?: string;
}

function machineLabel(workOrder: WorkOrder): string {
  if (!workOrder.machine_id) return "-";
  if (typeof workOrder.machine_id === "string") return workOrder.machine_id;
  return workOrder.machine_id.machine_id ?? "-";
}

export default function TechnicianDashboardPage() {
  const tTech = useTranslations("dashboard.technician");
  const tOperator = useTranslations("dashboard.operator");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    async function loadQueue() {
      try {
        setLoading(true);
        const response = await apiService.getWorkOrders();
        setWorkOrders(response.data ?? []);
      } catch (error) {
        console.error("Failed to load technician queue", error);
      } finally {
        setLoading(false);
      }
    }

    void loadQueue();
  }, []);

  const validationQueue = useMemo(
    () => workOrders.filter((wo) => wo.status === "waiting_validation"),
    [workOrders],
  );

  async function patchStatus(workOrder: WorkOrder, status: string): Promise<void> {
    try {
      setSavingId(workOrder._id);
      await apiService.updateWorkOrder(workOrder._id, {
        status,
        date_end: status === "completed" ? new Date().toISOString() : undefined,
      });
      setWorkOrders((prev) => prev.map((item) => (item._id === workOrder._id ? { ...item, status } : item)));
    } catch (error) {
      console.error("Failed to update status", error);
      window.alert(tCommon("error"));
    } finally {
      setSavingId("");
    }
  }

  async function createFollowUp(workOrder: WorkOrder): Promise<void> {
    try {
      setSavingId(workOrder._id);
      await apiService.createWorkOrder({
        ot_id: `WO-FUP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        machine_id:
          typeof workOrder.machine_id === "string" ? workOrder.machine_id : workOrder.machine_id?._id ?? "",
        description: `${workOrder.description ?? ""} | follow-up`,
        type_maintenance: workOrder.type_maintenance ?? "corrective",
        status: "assigned",
        priorite: "high",
        date_created: new Date().toISOString(),
      });
      await patchStatus(workOrder, "technician_required");
    } catch (error) {
      console.error("Failed to create follow-up", error);
      window.alert(tCommon("error"));
      setSavingId("");
    }
  }

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

          <div className="col-span-full panel">
            <div className="card-title mb-4">{tOperator("validationQueue")}</div>

            {loading ? (
              <div className="text-sm text-slate-500">{tCommon("loading")}</div>
            ) : validationQueue.length === 0 ? (
              <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {validationQueue.map((wo) => (
                  <div key={wo._id} className="border rounded-xl p-4">
                    <div className="font-semibold text-slate-800 mb-1">{wo.ot_id}</div>
                    <div className="text-sm text-slate-600 mb-1">{wo.description || tCommon("notAvailable")}</div>
                    <div className="text-xs text-slate-500 mb-1">
                      {tOperator("machine")}: {machineLabel(wo)}
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      {tOperator("validation")} : {wo.status}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={savingId === wo._id}
                        onClick={() => void patchStatus(wo, "completed")}
                        className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60"
                      >
                        {tOperator("approve")}
                      </button>
                      <button
                        disabled={savingId === wo._id}
                        onClick={() => void patchStatus(wo, "returned")}
                        className="px-3 py-2 rounded-lg bg-amber-600 text-white disabled:opacity-60"
                      >
                        {tOperator("reject")}
                      </button>
                      <button
                        disabled={savingId === wo._id}
                        onClick={() => void patchStatus(wo, "returned")}
                        className="px-3 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-60"
                      >
                        {tOperator("requestInfo")}
                      </button>
                      <button
                        disabled={savingId === wo._id}
                        onClick={() => void createFollowUp(wo)}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
                      >
                        {tOperator("createFollowUp")}
                      </button>
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

