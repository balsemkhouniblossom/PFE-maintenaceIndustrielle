"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";

type EntityRef = string | { _id?: string };

interface MachineType {
  _id: string;
  name: string;
}

interface Machine {
  _id: string;
  machine_id: string;
  type_id: EntityRef;
  model?: string;
}

interface ModuleEntity {
  _id: string;
  module_id: string;
  machine_id: EntityRef;
}

interface MaintenancePlan {
  _id: string;
  plan_id: string;
  module_id: EntityRef;
  type_maintenance?: string;
  instruction?: string;
}

interface DocumentEntity {
  _id: string;
  machine_id: EntityRef;
  file_path: string;
  file_name: string;
  type_document?: string;
}

interface Lubrifiant {
  _id: string;
  nom: string;
  type: string;
}

interface Kpi {
  _id: string;
  machine_id: EntityRef;
  mtbf_value?: number;
  mttr_value?: number;
  availability_rate?: number;
}

interface GeneratedReportRow {
  id: string;
  type: "preventive" | "corrective";
  workOrderId: string;
  reportId: string;
  machine: string;
  summary: string;
  createdAt: string;
  status: string;
}

type MachineCondition = "good" | "followUp" | "technicianRequired" | "custom";
const REPORTS_STORAGE_KEY = "operator_generated_reports_history";

function refId(value: EntityRef | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id ?? "";
}

function tokenizeInstructions(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(/\r?\n|[;,]/g)
    .map((item) => item.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function OperatorPreventivePage() {
  const t = useTranslations("dashboard.operator");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [modules, setModules] = useState<ModuleEntity[]>([]);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [lubrifiants, setLubrifiants] = useState<Lubrifiant[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [customMachine, setCustomMachine] = useState("");

  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [customTaskInput, setCustomTaskInput] = useState("");
  const [customTasks, setCustomTasks] = useState<string[]>([]);

  const [condition, setCondition] = useState<MachineCondition>("good");
  const [customCondition, setCustomCondition] = useState("");
  const [comments, setComments] = useState("");
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().slice(0, 16));

  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedLubrifiant, setSelectedLubrifiant] = useState("");
  const [lubrificationQty, setLubrificationQty] = useState("");
  const [submitValidationReason, setSubmitValidationReason] = useState("");
  const [generatedReports, setGeneratedReports] = useState<GeneratedReportRow[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!notification) return;

    const timeout = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [notification]);

  function showNotification(type: "success" | "error", message: string): void {
    setNotification({ type, message });
  }

  function addGeneratedReport(report: GeneratedReportRow): void {
    setGeneratedReports((prev) => {
      const next = [report, ...prev].slice(0, 30);
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as GeneratedReportRow[];
      if (Array.isArray(parsed)) {
        setGeneratedReports(parsed);
      }
    } catch {
      setGeneratedReports([]);
    }
  }, []);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [
          machineTypeRes,
          machinesRes,
          modulesRes,
          plansRes,
          documentsRes,
          lubrifiantsRes,
          kpiRes,
        ] = await Promise.all([
          apiService.getMachineTypes(),
          apiService.getMachines(),
          apiService.getModules(),
          apiService.getMaintenancePlans(),
          apiService.getDocuments(),
          apiService.getLubrifiants(),
          apiService.getKpis(),
        ]);

        setMachineTypes(machineTypeRes.data ?? []);
        setMachines(machinesRes.data ?? []);
        setModules(modulesRes.data ?? []);
        setPlans(plansRes.data ?? []);
        setDocuments(documentsRes.data ?? []);
        setLubrifiants(lubrifiantsRes.data ?? []);
        setKpis(kpiRes.data ?? []);
      } catch (error) {
        console.error("Failed to load preventive workflow data", error);
      } finally {
        setLoading(false);
      }
    }

    void loadAll();
  }, []);

  const machinesForCategory = useMemo(
    () => machines.filter((machine) => refId(machine.type_id) === selectedCategory),
    [machines, selectedCategory],
  );

  const modulesForMachine = useMemo(
    () => modules.filter((module) => refId(module.machine_id) === selectedMachine),
    [modules, selectedMachine],
  );

  const moduleIdSet = useMemo(() => new Set(modulesForMachine.map((module) => module._id)), [modulesForMachine]);

  const preventivePlans = useMemo(
    () =>
      plans.filter((plan) => {
        const maintenanceType = (plan.type_maintenance ?? "").toLowerCase();
        return moduleIdSet.has(refId(plan.module_id)) && maintenanceType.includes("prevent");
      }),
    [plans, moduleIdSet],
  );

  const taskList = useMemo(() => {
    const generated = preventivePlans.flatMap((plan) => tokenizeInstructions(plan.instruction));
    return Array.from(new Set(generated));
  }, [preventivePlans]);

  const manualDocument = useMemo(
    () =>
      documents.find((doc) => {
        const machineMatches = refId(doc.machine_id) === selectedMachine;
        const type = (doc.type_document ?? "").toLowerCase();
        return machineMatches && (type.includes("manual") || type.includes("procedure") || type.includes("pdf"));
      }) ?? null,
    [documents, selectedMachine],
  );

  const selectedMachineKpi = useMemo(
    () => kpis.find((item) => refId(item.machine_id) === selectedMachine) ?? null,
    [kpis, selectedMachine],
  );

  const allTaskItems = useMemo(() => [...taskList, ...customTasks], [taskList, customTasks]);

  const selectedTaskLabels = useMemo(
    () => allTaskItems.filter((task) => checkedTasks[task]),
    [allTaskItems, checkedTasks],
  );

  function toggleTask(task: string): void {
    setCheckedTasks((prev) => ({ ...prev, [task]: !prev[task] }));
  }

  function addCustomTask(): void {
    const value = customTaskInput.trim();
    if (!value) return;
    if (!customTasks.includes(value)) {
      setCustomTasks((prev) => [...prev, value]);
    }
    setCheckedTasks((prev) => ({ ...prev, [value]: true }));
    setCustomTaskInput("");
  }

  async function uploadPhotoIfPresent(machineId: string): Promise<void> {
    if (!photo || !user?._id) return;

    const formData = new FormData();
    formData.append("file", photo);
    formData.append("document_id", uniqueId("DOC"));
    formData.append("machine_id", machineId);
    formData.append("type_document", "maintenance_photo");
    formData.append("description", t("photoUpload"));
    formData.append("uploaded_by", user._id);

    await apiService.uploadDocument(formData);
  }

  async function submitPreventiveMaintenance(): Promise<void> {
    if (!user?._id || !selectedMachine) {
      setSubmitValidationReason("missing-user-or-machine");
      showNotification("error", t("validation"));
      return;
    }

    if (selectedTaskLabels.length === 0) {
      setSubmitValidationReason("no-tasks-selected");
      showNotification("error", t("preventiveTasks"));
      return;
    }

    const planRef = preventivePlans[0]?._id;
    const moduleRef = modulesForMachine[0]?._id;
    if (!moduleRef) {
      setSubmitValidationReason("missing-module-for-machine");
      showNotification("error", t("validation"));
      return;
    }

    const nowIso = new Date().toISOString();
    const startIso = new Date(completionDate).toISOString();
    const conditionValue = condition === "custom" ? customCondition.trim() : condition;

    setSubmitValidationReason("");
    setSubmitting(true);
    try {
      const workOrderPayload = {
        ot_id: uniqueId("WO-PREV"),
        machine_id: selectedMachine,
        module_id: moduleRef,
        technician_id: user._id,
        plan_id: planRef,
        description: selectedTaskLabels.join(" | "),
        type_maintenance: "preventive",
        status: "waiting_validation",
        priorite: "medium",
        date_created: nowIso,
        date_start: startIso,
      };

      const workOrderRes = await apiService.createWorkOrder(workOrderPayload);
      const workOrderId = workOrderRes?.data?._id as string | undefined;
      if (!workOrderId) {
        throw new Error("Work order creation failed");
      }

      const reportId = uniqueId("REP-PREV");

      const reportPayload = {
        report_id: reportId,
        ot_id: workOrderId,
        technician_id: user._id,
        date_debut: startIso,
        date_fin: nowIso,
        cause_racine: comments.trim() || undefined,
        description_action: selectedTaskLabels.join(" | "),
        etat_final: conditionValue,
        validation_responsable: "waiting_validation",
      };

      await apiService.createInterventionReport(reportPayload);

      if (selectedLubrifiant && lubrificationQty.trim()) {
        await apiService.createLubrificationLog({
          log_id: uniqueId("LUB-LOG"),
          module_id: moduleRef,
          lubrifiant_id: selectedLubrifiant,
          date_application: nowIso,
          quantite: Number(lubrificationQty),
          technician_id: user._id,
        });
      }

      await uploadPhotoIfPresent(selectedMachine);
      const machineLabel = machines.find((item) => item._id === selectedMachine)?.machine_id ?? tCommon("notAvailable");
      addGeneratedReport({
        id: `${workOrderId}-${reportId}`,
        type: "preventive",
        workOrderId,
        reportId,
        machine: machineLabel,
        summary: selectedTaskLabels.join(" | "),
        createdAt: nowIso,
        status: "waiting_validation",
      });
      showNotification("success", t("notifications.submitSuccess"));
    } catch (error) {
      console.error("Failed to submit preventive maintenance", error);
      setSubmitValidationReason("submit-failed");
      showNotification("error", tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="operator">
        <DashboardLayout title={t("preventiveMaintenance")}>
          <div className="panel">{tCommon("loading")}</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="operator">
      <DashboardLayout title={t("preventiveMaintenance")}>
        <div className="bento-grid">
          {notification ? (
            <div
              className={`col-span-full panel border ${
                notification.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {notification.message}
            </div>
          ) : null}

          <div className="col-span-full panel">
            <div className="card-title mb-4">{t("preventiveMaintenance")}</div>
            <div className="stats-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">{t("machineCategory")}</label>
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setSelectedMachine("");
                  }}
                  data-testid="preventive-category-select"
                  title={t("machineCategory")}
                  aria-label={t("machineCategory")}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">{tCommon("actions.search")}</option>
                  {machineTypes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-2"
                  placeholder={t("comments")}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">{t("machine")}</label>
                <select
                  value={selectedMachine}
                  onChange={(event) => setSelectedMachine(event.target.value)}
                  data-testid="preventive-machine-select"
                  title={t("machine")}
                  aria-label={t("machine")}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">{tCommon("actions.search")}</option>
                  {machinesForCategory.map((machine) => (
                    <option key={machine._id} value={machine._id}>
                      {machine.machine_id} {machine.model ? `- ${machine.model}` : ""}
                    </option>
                  ))}
                </select>
                <input
                  value={customMachine}
                  onChange={(event) => setCustomMachine(event.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-2"
                  placeholder={t("comments")}
                />
              </div>
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("preventiveTasks")}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allTaskItems.length === 0 && <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>}
              {allTaskItems.map((task, index) => (
                <label
                  key={task}
                  className={`flex items-start gap-3 text-sm rounded-lg border p-3 cursor-pointer transition-colors ${
                    checkedTasks[task]
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedTasks[task])}
                    onChange={() => toggleTask(task)}
                    data-testid={`preventive-task-checkbox-${index}`}
                    className="mt-0.5 h-4 w-4"
                  />
                  <span className="leading-5">{task}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                value={customTaskInput}
                onChange={(event) => setCustomTaskInput(event.target.value)}
                data-testid="preventive-custom-task-input"
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder={t("comments")}
              />
              <button
                onClick={addCustomTask}
                data-testid="preventive-add-custom-task"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white"
              >
                {tCommon("add")}
              </button>
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("machineCondition")}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={condition === "good"} onChange={() => setCondition("good")} />
                {t("good")}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={condition === "followUp"} onChange={() => setCondition("followUp")} />
                {t("followUp")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={condition === "technicianRequired"}
                  onChange={() => setCondition("technicianRequired")}
                />
                {t("technicianRequired")}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={condition === "custom"} onChange={() => setCondition("custom")} />
                {tCommon("edit")}
              </label>
            </div>
            {condition === "custom" && (
              <input
                value={customCondition}
                onChange={(event) => setCustomCondition(event.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-3"
                placeholder={t("comments")}
              />
            )}
          </div>

          <div className="col-span-full panel">
            <div className="stats-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">{t("comments")}</label>
                <input
                  value={comments}
                  onChange={(event) => setComments(event.target.value.slice(0, 180))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t("comments")}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">{t("report")}</label>
                <input
                  type="datetime-local"
                  value={completionDate}
                  onChange={(event) => setCompletionDate(event.target.value)}
                  title={t("report")}
                  aria-label={t("report")}
                  placeholder={t("report")}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("photoUpload")}</div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              title={t("photoUpload")}
              aria-label={t("photoUpload")}
              placeholder={t("photoUpload")}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("openManual")}</div>
            <div className="flex flex-wrap gap-3">
              {manualDocument ? (
                <a
                  href={manualDocument.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  {t("openManual")}
                </a>
              ) : (
                <span className="text-sm text-slate-500">{tCommon("table.noData")}</span>
              )}
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("kpiTitle")}</div>
            {selectedMachineKpi ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="border rounded-lg p-3">{t("mtbf")}: {selectedMachineKpi.mtbf_value ?? tCommon("notAvailable")}</div>
                <div className="border rounded-lg p-3">{t("mttr")}: {selectedMachineKpi.mttr_value ?? tCommon("notAvailable")}</div>
                <div className="border rounded-lg p-3">
                  {t("availability")}: {selectedMachineKpi.availability_rate ?? tCommon("notAvailable")}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
            )}
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("preventiveMaintenance")}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm mb-2">{t("lubricant")}</label>
                <select
                  value={selectedLubrifiant}
                  onChange={(event) => setSelectedLubrifiant(event.target.value)}
                  title={t("lubricant")}
                  aria-label={t("lubricant")}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">{tCommon("actions.search")}</option>
                  {lubrifiants.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.nom} ({item.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">{t("quantity")}</label>
                <input
                  type="number"
                  min="0"
                  value={lubrificationQty}
                  onChange={(event) => setLubrificationQty(event.target.value)}
                  title={t("quantity")}
                  aria-label={t("quantity")}
                  placeholder={t("quantity")}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button
              disabled={submitting}
              onClick={() => void submitPreventiveMaintenance()}
              data-testid="preventive-submit-button"
              className="w-full md:w-auto px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white"
            >
              {submitting ? tCommon("saving") : t("generateReport")}
            </button>
            {submitValidationReason ? (
              <div data-testid="preventive-submit-validation" className="text-sm text-red-600 mt-3">
                {submitValidationReason}
              </div>
            ) : null}
          </div>

          <div className="col-span-full panel overflow-x-auto">
            <div className="card-title mb-3">{t("myReports")}</div>
            {generatedReports.filter((item) => item.type === "preventive").length === 0 ? (
              <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3">{t("report")}</th>
                    <th className="text-left py-2 px-3">{t("workOrder")}</th>
                    <th className="text-left py-2 px-3">{t("machine")}</th>
                    <th className="text-left py-2 px-3">{t("actionsPerformed")}</th>
                    <th className="text-left py-2 px-3">{t("validation")}</th>
                    <th className="text-left py-2 px-3">{tCommon("time.justNow")}</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports
                    .filter((item) => item.type === "preventive")
                    .map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-2 px-3 font-mono text-xs">{item.reportId}</td>
                        <td className="py-2 px-3 font-mono text-xs">{item.workOrderId}</td>
                        <td className="py-2 px-3">{item.machine}</td>
                        <td className="py-2 px-3 truncate max-w-xs">{item.summary}</td>
                        <td className="py-2 px-3">{item.status === "waiting_validation" ? t("waitingValidation") : item.status}</td>
                        <td className="py-2 px-3">{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
