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
  type_id: EntityRef;
  model?: string;
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
  cause_probable?: string;
  solution_recommandee?: string;
}

interface DocumentEntity {
  _id: string;
  machine_id: EntityRef;
  file_path: string;
  type_document?: string;
}

interface Catalogue {
  _id: string;
  part_id: string;
  nom_piece: string;
  ref_constructeur: string;
}

interface Stock {
  _id: string;
  part_id: EntityRef;
  quantite_en_stock: number;
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

type CorrectiveResult = "solved" | "notSolved" | "technicianRequired" | "custom";

export default function OperatorCorrectivePage() {
  const t = useTranslations("dashboard.operator");
  const tCommon = useTranslations("common");
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [pannes, setPannes] = useState<Panne[]>([]);
  const [panneSolutions, setPanneSolutions] = useState<PanneSolution[]>([]);
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedPanne, setSelectedPanne] = useState("");

  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [customActionInput, setCustomActionInput] = useState("");
  const [customActions, setCustomActions] = useState<string[]>([]);

  const [result, setResult] = useState<CorrectiveResult>("solved");
  const [customResult, setCustomResult] = useState("");
  const [comments, setComments] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({});
  const [submitValidationReason, setSubmitValidationReason] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [
          machineTypeRes,
          machinesRes,
          pannesRes,
          panneSolutionsRes,
          documentsRes,
          cataloguesRes,
          stocksRes,
        ] = await Promise.all([
          apiService.getMachineTypes(),
          apiService.getMachines(),
          apiService.getPannes(),
          apiService.getPanneSolutions(),
          apiService.getDocuments(),
          apiService.getCatalogues(),
          apiService.getStocks(),
        ]);

        setMachineTypes(machineTypeRes.data ?? []);
        setMachines(machinesRes.data ?? []);
        setPannes(pannesRes.data ?? []);
        setPanneSolutions(panneSolutionsRes.data ?? []);
        setDocuments(documentsRes.data ?? []);
        setCatalogues(cataloguesRes.data ?? []);
        setStocks(stocksRes.data ?? []);
      } catch (error) {
        console.error("Failed to load corrective workflow data", error);
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

  const selectedFault = useMemo(
    () => pannes.find((item) => item._id === selectedPanne) ?? null,
    [pannes, selectedPanne],
  );

  const correctiveTasks = useMemo(() => {
    const matching = panneSolutions
      .filter((solution) => refId(solution.panne_id) === selectedPanne)
      .flatMap((solution) => tokenize(solution.solution_recommandee));
    return Array.from(new Set(matching));
  }, [panneSolutions, selectedPanne]);

  const allTasks = useMemo(() => [...correctiveTasks, ...customActions], [correctiveTasks, customActions]);

  const selectedActionLabels = useMemo(
    () => allTasks.filter((task) => checkedActions[task]),
    [allTasks, checkedActions],
  );

  const manualDocument = useMemo(
    () =>
      documents.find((doc) => {
        const machineMatches = refId(doc.machine_id) === selectedMachine;
        const type = (doc.type_document ?? "").toLowerCase();
        return machineMatches && (type.includes("manual") || type.includes("procedure") || type.includes("pdf"));
      }) ?? null,
    [documents, selectedMachine],
  );

  const stockByCatalogueId = useMemo(() => {
    const stockMap = new Map<string, number>();
    stocks.forEach((stock) => {
      stockMap.set(refId(stock.part_id), stock.quantite_en_stock ?? 0);
    });
    return stockMap;
  }, [stocks]);

  function toggleTask(task: string): void {
    setCheckedActions((prev) => ({ ...prev, [task]: !prev[task] }));
  }

  function addCustomAction(): void {
    const value = customActionInput.trim();
    if (!value) return;
    if (!customActions.includes(value)) {
      setCustomActions((prev) => [...prev, value]);
    }
    setCheckedActions((prev) => ({ ...prev, [value]: true }));
    setCustomActionInput("");
  }

  function setPartQuantity(catalogueId: string, quantity: string): void {
    setSelectedParts((prev) => ({ ...prev, [catalogueId]: quantity }));
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

  async function submitCorrectiveMaintenance(): Promise<void> {
    if (!user?._id || !selectedMachine || !selectedFault) {
      setSubmitValidationReason("missing-user-machine-or-fault");
      window.alert(t("validation"));
      return;
    }

    if (selectedActionLabels.length === 0) {
      setSubmitValidationReason("no-actions-selected");
      window.alert(t("actionsPerformed"));
      return;
    }

    const nowIso = new Date().toISOString();
    const resultValue = result === "custom" ? customResult.trim() : result;

    setSubmitValidationReason("");
    setSubmitting(true);
    try {
      const workOrderPayload = {
        ot_id: uniqueId("WO-COR"),
        machine_id: selectedMachine,
        technician_id: user._id,
        description: `${selectedFault.code_panne} | ${selectedActionLabels.join(" | ")}`,
        type_maintenance: "corrective",
        status: "waiting_validation",
        priorite: "high",
        code_panne: selectedFault.code_panne,
        date_created: nowIso,
        date_start: nowIso,
      };

      const workOrderRes = await apiService.createWorkOrder(workOrderPayload);
      const workOrderId = workOrderRes?.data?._id as string | undefined;
      if (!workOrderId) {
        throw new Error("Work order creation failed");
      }

      const reportPayload = {
        report_id: uniqueId("REP-COR"),
        ot_id: workOrderId,
        technician_id: user._id,
        date_debut: nowIso,
        date_fin: nowIso,
        cause_racine: selectedFault.description,
        description_action: selectedActionLabels.join(" | "),
        etat_final: resultValue,
        validation_responsable: "waiting_validation",
      };

      await apiService.createInterventionReport(reportPayload);

      const requestedParts = Object.entries(selectedParts)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([partId, quantity]) => ({ partId, quantity: Number(quantity) }));

      await Promise.all(
        requestedParts.map((part) =>
          apiService.createOtPiece({
            ot_id: workOrderId,
            part_id: part.partId,
            quantite: part.quantity,
          }),
        ),
      );

      await uploadPhotoIfPresent(selectedMachine);
      window.alert(t("waitingValidation"));
    } catch (error) {
      console.error("Failed to submit corrective maintenance", error);
      setSubmitValidationReason("submit-failed");
      window.alert(tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="operator">
        <DashboardLayout title={t("correctiveMaintenance")}>
          <div className="panel">{tCommon("loading")}</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="operator">
      <DashboardLayout title={t("correctiveMaintenance")}>
        <div className="bento-grid">
          <div className="col-span-full panel">
            <div className="card-title mb-4">{t("correctiveMaintenance")}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">{t("machineCategory")}</label>
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setSelectedMachine("");
                  }}
                  data-testid="corrective-category-select"
                  title={t("machineCategory")}
                  aria-label={t("machineCategory")}
                  className="w-full border rounded-lg px-3 py-2"
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
                  data-testid="corrective-machine-select"
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
              </div>

              <div>
                <label className="block text-sm mb-2">{t("fault")}</label>
                <select
                  value={selectedPanne}
                  onChange={(event) => setSelectedPanne(event.target.value)}
                  data-testid="corrective-fault-select"
                  title={t("fault")}
                  aria-label={t("fault")}
                  className="w-full border rounded-lg px-3 py-2"
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
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("solution")}</div>
            <div className="text-sm text-slate-600 mb-3">
              {selectedFault ? `${selectedFault.code_panne} - ${selectedFault.description}` : tCommon("table.noData")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allTasks.length === 0 && <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>}
              {allTasks.map((task, index) => (
                <label key={task} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(checkedActions[task])}
                    onChange={() => toggleTask(task)}
                    data-testid={`corrective-task-checkbox-${index}`}
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                value={customActionInput}
                onChange={(event) => setCustomActionInput(event.target.value)}
                data-testid="corrective-custom-action-input"
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder={t("actionsPerformed")}
              />
              <button
                onClick={addCustomAction}
                data-testid="corrective-add-custom-action"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white"
              >
                {tCommon("add")}
              </button>
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-3">{t("actionsPerformed")}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={result === "solved"} onChange={() => setResult("solved")} />
                {t("solved")}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={result === "notSolved"} onChange={() => setResult("notSolved")} />
                {t("notSolved")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={result === "technicianRequired"}
                  onChange={() => setResult("technicianRequired")}
                />
                {t("technicianRequired")}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={result === "custom"} onChange={() => setResult("custom")} />
                {tCommon("edit")}
              </label>
            </div>
            {result === "custom" && (
              <input
                value={customResult}
                onChange={(event) => setCustomResult(event.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-3"
                placeholder={t("comments")}
              />
            )}
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
            <div className="card-title mb-3">{t("spareParts")}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catalogues.map((part) => (
                <div key={part._id} className="border rounded-lg p-3">
                  <div className="font-medium">{part.nom_piece}</div>
                  <div className="text-xs text-slate-500">{part.ref_constructeur}</div>
                  <div className="text-xs mt-1">
                    {t("stockQuantity")}: {stockByCatalogueId.get(part._id) ?? 0}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={selectedParts[part._id] ?? ""}
                    onChange={(event) => setPartQuantity(part._id, event.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-2"
                    placeholder={t("partRequest")}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-full panel">
            <label className="block text-sm mb-2">{t("comments")}</label>
            <input
              value={comments}
              onChange={(event) => setComments(event.target.value.slice(0, 180))}
              data-testid="corrective-comments-input"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder={t("comments")}
            />

            {submitValidationReason ? (
              <div data-testid="corrective-submit-validation" className="text-sm text-red-600 mb-3">
                {submitValidationReason}
              </div>
            ) : null}

            <button
              disabled={submitting}
              onClick={() => void submitCorrectiveMaintenance()}
              data-testid="corrective-submit-button"
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
