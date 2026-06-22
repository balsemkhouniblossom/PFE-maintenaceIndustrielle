"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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

interface DocumentEntity {
  _id: string;
  machine_id: EntityRef;
  type_document?: string;
  file_name: string;
  file_path: string;
  description?: string;
}

function refId(value: EntityRef | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id ?? "";
}

export default function OperatorManualsPage() {
  const t = useTranslations("dashboard.operator");
  const tCommon = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [machineTypesRes, machinesRes, documentsRes] = await Promise.all([
          apiService.getMachineTypes(),
          apiService.getMachines(),
          apiService.getDocuments(),
        ]);

        setMachineTypes(machineTypesRes.data ?? []);
        setMachines(machinesRes.data ?? []);
        setDocuments(documentsRes.data ?? []);
      } catch (error) {
        console.error("Failed to load manuals", error);
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

  const visibleDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedMachine && refId(doc.machine_id) !== selectedMachine) return false;
      if (!selectedMachine && selectedType) {
        const machine = machines.find((item) => item._id === refId(doc.machine_id));
        if (!machine || refId(machine.type_id) !== selectedType) return false;
      }

      const type = (doc.type_document ?? "").toLowerCase();
      return type.includes("manual") || type.includes("pdf") || type.includes("procedure") || type.includes("diagram");
    });
  }, [documents, machines, selectedMachine, selectedType]);

  return (
    <ProtectedRoute requiredRole="operator">
      <DashboardLayout title={t("machineManuals")}>
        <div className="bento-grid">
          <div className="col-span-full panel">
            <div className="card-title mb-4">{t("machineManuals")}</div>
            <p className="text-sm text-slate-600 mb-4">{t("manualsIntro")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          <div className="col-span-full panel">
            <div className="card-title mb-4">{t("openManual")}</div>

            {loading ? (
              <div className="text-sm text-slate-500">{tCommon("loading")}</div>
            ) : visibleDocuments.length === 0 ? (
              <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleDocuments.map((doc) => (
                  <div key={doc._id} className="border rounded-xl p-4">
                    <div className="font-semibold mb-1">{doc.file_name}</div>
                    <div className="text-xs text-slate-500 mb-3">{doc.type_document || tCommon("notAvailable")}</div>
                    {doc.description ? <div className="text-sm text-slate-600 mb-3">{doc.description}</div> : null}
                    <div className="flex gap-2">
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
                      >
                        {t("openManual")}
                      </a>
                      <a
                        href={doc.file_path}
                        download
                        className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm"
                      >
                        {t("download")}
                      </a>
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
