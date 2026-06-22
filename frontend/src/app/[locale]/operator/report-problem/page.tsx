"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useTranslations } from "next-intl";

type EntityRef = string | { _id?: string };

interface MachineType {
  _id: string;
  name: string;
}

interface Machine {
  _id: string;
  machine_id: string;
  model?: string;
  type_id: EntityRef;
}

interface Panne {
  _id: string;
  code_panne: string;
  description: string;
  gravite?: string;
}

interface PanneSolution {
  _id: string;
  panne_id: EntityRef;
  solution_recommandee?: string;
}

interface DocumentEntity {
  _id: string;
  machine_id: EntityRef;
  file_path: string;
  type_document?: string;
}

function refId(value: EntityRef | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id ?? "";
}

function tokenize(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(/\r?\n|[;,]/g)
    .map((item) => item.replace(/^[-*\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function OperatorReportProblemPage() {
  const t = useTranslations("dashboard.operator");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [pannes, setPannes] = useState<Panne[]>([]);
  const [solutions, setSolutions] = useState<PanneSolution[]>([]);
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedPanne, setSelectedPanne] = useState("");
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [customAction, setCustomAction] = useState("");
  const [customActions, setCustomActions] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [machineTypesRes, machinesRes, pannesRes, solutionsRes, documentsRes] = await Promise.all([
          apiService.getMachineTypes(),
          apiService.getMachines(),
          apiService.getPannes(),
          apiService.getPanneSolutions(),
          apiService.getDocuments(),
        ]);

        setMachineTypes(machineTypesRes.data ?? []);
        setMachines(machinesRes.data ?? []);
        setPannes(pannesRes.data ?? []);
        setSolutions(solutionsRes.data ?? []);
        setDocuments(documentsRes.data ?? []);
      } catch (error) {
        console.error("Failed to load report-problem data", error);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const machinesForType = useMemo(
    () => machines.filter((machine) => refId(machine.type_id) === selectedType),
    [machines, selectedType],
  );

  const selectedFault = useMemo(
    () => pannes.find((item) => item._id === selectedPanne) ?? null,
    [pannes, selectedPanne],
  );

  const autoActions = useMemo(() => {
    return Array.from(
      new Set(
        solutions
          .filter((solution) => refId(solution.panne_id) === selectedPanne)
          .flatMap((solution) => tokenize(solution.solution_recommandee)),
      ),
    );
  }, [solutions, selectedPanne]);

  const actionList = useMemo(() => [...autoActions, ...customActions], [autoActions, customActions]);

  const manualDocument = useMemo(
    () =>
      documents.find((doc) => {
        if (refId(doc.machine_id) !== selectedMachine) return false;
        const type = (doc.type_document ?? "").toLowerCase();
        return type.includes("manual") || type.includes("procedure") || type.includes("pdf");
      }) ?? null,
    [documents, selectedMachine],
  );

  function toggleAction(action: string): void {
    setCheckedActions((prev) => ({ ...prev, [action]: !prev[action] }));
  }

  function addCustomAction(): void {
    const value = customAction.trim();
    if (!value) return;
    if (!customActions.includes(value)) {
      setCustomActions((prev) => [...prev, value]);
    }
    setCheckedActions((prev) => ({ ...prev, [value]: true }));
    setCustomAction("");
  }

  async function uploadPhotoIfPresent(machineId: string): Promise<void> {
    if (!photo || !user?._id) return;

    const formData = new FormData();
    formData.append("file", photo);
    formData.append("document_id", uniqueId("DOC"));
    formData.append("machine_id", machineId);
    formData.append("type_document", "fault_photo");
    formData.append("description", t("photoUpload"));
    formData.append("uploaded_by", user._id);

    await apiService.uploadDocument(formData);
  }

  async function submitReport(): Promise<void> {
    if (!user?._id || !selectedMachine || !selectedFault) {
      window.alert(t("validation"));
      return;
    }

    const selectedActions = actionList.filter((item) => checkedActions[item]);
    if (selectedActions.length === 0) {
      window.alert(t("actionsPerformed"));
      return;
    }

    const nowIso = new Date().toISOString();

    setSubmitting(true);
    try {
      const workOrderRes = await apiService.createWorkOrder({
        ot_id: uniqueId("WO-RP"),
        machine_id: selectedMachine,
        technician_id: user._id,
        description: `${selectedFault.code_panne} | ${selectedActions.join(" | ")}`,
        type_maintenance: "corrective",
        status: "waiting_validation",
        priorite: "high",
        code_panne: selectedFault.code_panne,
        date_created: nowIso,
        date_start: nowIso,
      });

      const workOrderId = workOrderRes?.data?._id as string | undefined;
      if (!workOrderId) {
        throw new Error("Work order creation failed");
      }

      await apiService.createInterventionReport({
        report_id: uniqueId("REP-RP"),
        ot_id: workOrderId,
        technician_id: user._id,
        date_debut: nowIso,
        date_fin: nowIso,
        cause_racine: selectedFault.description,
        description_action: selectedActions.join(" | "),
        etat_final: "waiting_validation",
        validation_responsable: "waiting_validation",
      });

      await uploadPhotoIfPresent(selectedMachine);
      window.alert(t("waitingValidation"));
    } catch (error) {
      console.error("Failed to submit report", error);
      window.alert(tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute requiredRole="operator">
      <DashboardLayout title={t("reportProblem")}>
        <div className="bento-grid">
          <div className="col-span-full panel">
            <div className="card-title mb-4">{t("reportProblem")}</div>

            {loading ? (
              <div className="text-sm text-slate-500">{tCommon("loading")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2">{t("machineCategory")}</label>
                  <select
                    value={selectedType}
                    onChange={(event) => {
                      setSelectedType(event.target.value);
                      setSelectedMachine("");
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    title={t("machineCategory")}
                    aria-label={t("machineCategory")}
                  >
                    <option value="">{tCommon("actions.search")}</option>
                    {machineTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">{t("machine")}</label>
                  <select
                    value={selectedMachine}
                    onChange={(event) => setSelectedMachine(event.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    title={t("machine")}
                    aria-label={t("machine")}
                  >
                    <option value="">{tCommon("actions.search")}</option>
                    {machinesForType.map((machine) => (
                      <option key={machine._id} value={machine._id}>
                        {machine.machine_id} {machine.model ? `- ${machine.model}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">{t("fault")}</label>
                  <select
                    value={selectedPanne}
                    onChange={(event) => setSelectedPanne(event.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    title={t("fault")}
                    aria-label={t("fault")}
                  >
                    <option value="">{tCommon("actions.search")}</option>
                    {pannes.map((panne) => (
                      <option key={panne._id} value={panne._id}>
                        {panne.code_panne} - {panne.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("solution")}</div>
            <div className="text-sm text-slate-600 mb-3">
              {selectedFault
                ? `${selectedFault.code_panne} | ${selectedFault.description} | ${selectedFault.gravite || tCommon("notAvailable")}`
                : tCommon("table.noData")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {actionList.length === 0 && <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>}
              {actionList.map((action) => (
                <label key={action} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(checkedActions[action])}
                    onChange={() => toggleAction(action)}
                  />
                  <span>{action}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                value={customAction}
                onChange={(event) => setCustomAction(event.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder={t("actionsPerformed")}
              />
              <button onClick={addCustomAction} className="px-4 py-2 rounded-lg bg-slate-900 text-white">
                {tCommon("add")}
              </button>
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("openManual")}</div>
            {manualDocument ? (
              <a
                href={manualDocument.file_path}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                {t("openManual")}
              </a>
            ) : (
              <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
            )}
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("photoUpload")}</div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              className="w-full border rounded-lg px-3 py-2"
              title={t("photoUpload")}
              aria-label={t("photoUpload")}
              placeholder={t("photoUpload")}
            />
          </div>

          <div className="col-span-full panel">
            <button
              disabled={submitting}
              onClick={() => void submitReport()}
              className="w-full md:w-auto px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white"
            >
              {submitting ? tCommon("saving") : t("generateReport")}
            </button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
