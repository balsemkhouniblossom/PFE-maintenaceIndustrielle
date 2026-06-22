"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DynamicSearchControls from "@/components/DynamicSearchControls";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useTranslations } from "next-intl";
import { apiService } from "@/services/api";
import { ALL_FIELDS_TOKEN, getSearchableFields, matchesDynamicSearch } from "@/services/dynamicSearch";
import { CheckIcon, XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";

type EntityRef = string | { _id?: string };

interface MaintenancePlan {
  _id: string;
  plan_id: string;
  module_id: EntityRef;
  type_maintenance?: string;
  frequence?: number;
  unite_frequence?: string;
  instruction?: string;
  responsable?: string;
  huile_graisse?: string;
  documentation?: string;
  maintenance_code?: string;
  frequence_label?: string;
}

interface Module {
  _id: string;
  module_id?: string;
  machine_id?: EntityRef;
}

interface Machine {
  _id: string;
  machine_id: string;
  model?: string;
  type_id?: EntityRef;
}

interface PreventiveTask {
  id: string;
  planId: string;
  plan_id: string;
  moduleId: string;
  machineId: string;
  instruction: string;
  responsable?: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

interface PreventiveTaskFilter {
  all: "all";
  pending: "pending";
  completed: "completed";
  overdue: "overdue";
}

function refId(value: EntityRef | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id ?? "";
}

export default function PreventiveTaskChecklistPage() {
  const t = useTranslations("preventiveTaskChecklist");
  const tCommon = useTranslations("common");

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [tasks, setTasks] = useState<PreventiveTask[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<keyof PreventiveTaskFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(ALL_FIELDS_TOKEN);
  const [selectedTask, setSelectedTask] = useState<PreventiveTask | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [plansRes, modulesRes, machinesRes] = await Promise.all([
          apiService.getMaintenancePlans(),
          apiService.getModules(),
          apiService.getMachines(),
        ]);

        const plansData: MaintenancePlan[] = plansRes.data ?? [];
        const modulesData: Module[] = modulesRes.data ?? [];
        const machinesData: Machine[] = machinesRes.data ?? [];

        setPlans(plansData);
        setModules(modulesData);
        setMachines(machinesData);

        // Filter for preventive maintenance plans
        const preventivePlans = plansData.filter((plan) => {
          const maintenanceType = (plan.type_maintenance ?? "").toLowerCase();
          return maintenanceType.includes("prevent");
        });

        // Generate tasks from preventive plans
        const generatedTasks: PreventiveTask[] = [];
        preventivePlans.forEach((plan) => {
          if (plan.instruction) {
            const taskList = plan.instruction
              .split(/\r?\n|[;,]/g)
              .map((item) => item.replace(/^[-*\u2022\s]+/, "").trim())
              .filter(Boolean);

            taskList.forEach((instruction, idx) => {
              generatedTasks.push({
                id: `${plan._id}-${idx}`,
                planId: plan._id,
                plan_id: plan.plan_id,
                moduleId: refId(plan.module_id),
                machineId: "", // Will be populated from module
                instruction,
                responsable: plan.responsable,
                completed: false,
              });
            });
          }
        });

        // Try to load tasks from localStorage (persisted completion status)
        const savedTasks = localStorage.getItem("preventive_tasks");
        if (savedTasks) {
          try {
            const savedState = JSON.parse(savedTasks);
            generatedTasks.forEach((task) => {
              const saved = savedState.find((s: PreventiveTask) => s.id === task.id);
              if (saved) {
                task.completed = saved.completed;
                task.completedAt = saved.completedAt;
                task.notes = saved.notes;
              }
            });
          } catch {
            // Continue if parsing fails
          }
        }

        setTasks(generatedTasks);

        if (generatedTasks.length === 0) {
          setNotification({
            type: "info",
            message: t("notifications.noTasksAvailable"),
          });
        }
      } catch (error) {
        console.error("Failed to load preventive tasks", error);
        setNotification({
          type: "error",
          message: t("notifications.loadFailed"),
        });
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [t]);

  // Get module name
  const getModuleName = (moduleId: string): string => {
    const module = modules.find((m) => m._id === moduleId);
    return module?.module_id ?? tCommon("notAvailable");
  };

  // Get machine name
  const getMachineName = (moduleId: string): string => {
    const module = modules.find((m) => m._id === moduleId);
    if (!module) return tCommon("notAvailable");
    const machine = machines.find((m) => m._id === refId(module.machine_id));
    return machine ? machine.machine_id : tCommon("notAvailable");
  };

  const searchableTasks = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        machine_label: getMachineName(task.moduleId),
        module_label: getModuleName(task.moduleId),
      })),
    [tasks, modules, machines],
  );

  const searchableFields = useMemo(() => getSearchableFields(searchableTasks), [searchableTasks]);

  // Filter tasks based on search and selected filter
  const filteredTasks = useMemo(() => {
    return searchableTasks.filter((task) => {
      const matchesSearch = matchesDynamicSearch(task, searchTerm, selectedSearchField);

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "pending" && !task.completed) ||
        (selectedFilter === "completed" && task.completed);

      return matchesSearch && matchesFilter;
    });
  }, [searchableTasks, searchTerm, selectedSearchField, selectedFilter]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  }), [tasks]);

  // Handle task completion toggle
  const toggleTaskCompletion = async (task: PreventiveTask) => {
    setSelectedTask(task);
    if (task.completed) {
      // If already completed, just toggle it back
      const updatedTasks = tasks.map((t) =>
        t.id === task.id
          ? { ...t, completed: false, completedAt: undefined, notes: undefined }
          : t
      );
      setTasks(updatedTasks);
      localStorage.setItem("preventive_tasks", JSON.stringify(updatedTasks));
      setNotification({
        type: "success",
        message: t("notifications.taskUpdated"),
      });
    } else {
      // Show modal for completion with notes
      setShowModal(true);
    }
    setSelectedTask(null);
  };

  // Handle marking task as complete with notes
  const markTaskComplete = () => {
    if (!selectedTask) return;

    const updatedTasks = tasks.map((t) =>
      t.id === selectedTask.id
        ? {
          ...t,
          completed: true,
          completedAt: new Date().toISOString(),
          notes: completionNotes,
        }
        : t
    );

    setTasks(updatedTasks);
    localStorage.setItem("preventive_tasks", JSON.stringify(updatedTasks));
    setNotification({
      type: "success",
      message: t("notifications.taskMarkedComplete"),
    });
    setShowModal(false);
    setCompletionNotes("");
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "technician"]}>
        <DashboardLayout title={t("title")}>
          <div className="panel flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
              <p>{tCommon("loading")}</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "technician"]}>
      <DashboardLayout title={t("title")}>
        <div className="bento-grid">
          {/* Header */}
          <div className="col-span-full panel">
            <h1 className="card-title mb-2">{t("heading")}</h1>
            <p className="text-sm text-slate-600 mb-4">{t("description")}</p>
          </div>

          {/* Statistics */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="panel">
              <div className="text-sm text-slate-600">{t("totalTasks")}</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="panel">
              <div className="text-sm text-slate-600">{t("completedTasks")}</div>
              <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
            </div>
            <div className="panel">
              <div className="text-sm text-slate-600">{t("pendingTasks")}</div>
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="col-span-full panel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("actions.filter")}</label>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "pending", "completed", "overdue"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedFilter === filter
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                      }`}
                    >
                      {t(`filters.${filter}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{tCommon("actions.search")}</label>
                <DynamicSearchControls
                  className=""
                  selectClassName="w-full border rounded-lg px-3 py-2"
                  inputClassName="w-full border rounded-lg px-3 py-2 pl-10"
                  selectedField={selectedSearchField}
                  onSelectedFieldChange={setSelectedSearchField}
                  searchableFields={searchableFields}
                  allFieldsLabel={tCommon("table.allFields", { default: "All fields" })}
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  searchPlaceholder={t("placeholders.taskName")}
                />
              </div>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`col-span-full panel ${
                notification.type === "error"
                  ? "bg-red-50 border-l-4 border-red-600"
                  : notification.type === "success"
                  ? "bg-emerald-50 border-l-4 border-emerald-600"
                  : "bg-blue-50 border-l-4 border-blue-600"
              }`}
            >
              <p
                className={
                  notification.type === "error"
                    ? "text-red-800"
                    : notification.type === "success"
                    ? "text-emerald-800"
                    : "text-blue-800"
                }
              >
                {notification.message}
              </p>
            </div>
          )}

          {/* Tasks Table */}
          <div className="col-span-full panel overflow-x-auto">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">{t("empty.default")}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold">{t("table.planId")}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t("table.machine")}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t("table.module")}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t("table.instruction")}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t("table.responsable")}</th>
                    <th className="text-center py-3 px-4 font-semibold">{t("table.status")}</th>
                    <th className="text-center py-3 px-4 font-semibold">{tCommon("actions.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className={`border-b border-slate-100 ${
                        task.completed ? "bg-emerald-50" : ""
                      } hover:bg-slate-50 transition-colors`}
                    >
                      <td className="py-3 px-4 font-mono text-xs">{task.plan_id}</td>
                      <td className="py-3 px-4">{getMachineName(task.moduleId)}</td>
                      <td className="py-3 px-4">{getModuleName(task.moduleId)}</td>
                      <td className="py-3 px-4">{task.instruction}</td>
                      <td className="py-3 px-4">{task.responsable || tCommon("notAvailable")}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            task.completed
                              ? "bg-emerald-200 text-emerald-800"
                              : "bg-amber-200 text-amber-800"
                          }`}
                        >
                          {task.completed ? t("status.completed") : t("status.pending")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => toggleTaskCompletion(task)}
                            title={task.completed ? tCommon("edit") : t("actions.complete")}
                            className={`p-2 rounded-lg transition-colors ${
                              task.completed
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-amber-600 hover:bg-amber-700 text-white"
                            }`}
                          >
                            {task.completed ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <CheckIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setCompletionNotes(task.notes || "");
                              setShowModal(true);
                            }}
                            title={t("actions.view")}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Task Details Modal */}
        {showModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">{t("modal.taskDetails")}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  aria-label={tCommon("close")}
                  title={tCommon("close")}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("table.planId")}</label>
                  <p className="text-slate-900">{selectedTask.plan_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("table.machine")}</label>
                  <p className="text-slate-900">{getMachineName(selectedTask.moduleId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("table.instruction")}</label>
                  <p className="text-slate-900">{selectedTask.instruction}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("form.notes")}</label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder={t("placeholders.notes")}
                    className="w-full border rounded-lg px-3 py-2 h-24"
                  />
                </div>
                {selectedTask.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Completed At</label>
                    <p className="text-slate-900">
                      {new Date(selectedTask.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 border-t p-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300 transition-colors"
                >
                  {tCommon("actions.cancel")}
                </button>
                {!selectedTask.completed && (
                  <button
                    onClick={markTaskComplete}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    {t("actions.complete")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
