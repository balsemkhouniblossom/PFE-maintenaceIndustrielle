"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DynamicSearchControls from "@/components/DynamicSearchControls";
import { apiService } from "@/services/api";
import { ALL_FIELDS_TOKEN, getSearchableFields, matchesDynamicSearch } from "@/services/dynamicSearch";
import { useTranslations } from "next-intl";

interface Lubrifiant {
  _id: string;
  lubrifiant_id?: string;
  nom?: string;
  type?: string;
  viscosite?: string;
}

export default function LubrifiantsPage() {
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Lubrifiant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(ALL_FIELDS_TOKEN);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.getLubrifiants();
        setItems(res.data ?? []);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const searchableFields = useMemo(() => getSearchableFields(items), [items]);
  const filteredItems = useMemo(
    () => items.filter((item) => matchesDynamicSearch(item, searchTerm, selectedSearchField)),
    [items, searchTerm, selectedSearchField],
  );

  return (
    <DashboardLayout title="Lubrifiants">
      <div className="bento-grid">
        <div className="col-span-full panel">
          <div className="flex items-center justify-between mb-3">
            <h2 className="card-title">Lubrifiants</h2>
            <div className="text-sm text-slate-500">{filteredItems.length}</div>
          </div>

          <DynamicSearchControls
            className=""
            selectedField={selectedSearchField}
            onSelectedFieldChange={setSelectedSearchField}
            searchableFields={searchableFields}
            allFieldsLabel={tCommon("table.allFields", { default: "All fields" })}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            searchPlaceholder="Search lubrifiants..."
          />
        </div>

        <div className="col-span-full panel overflow-x-auto">
          {loading ? (
            <div className="text-sm text-slate-500">{tCommon("loading")}</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-sm text-slate-500">{tCommon("table.noData")}</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Viscosity</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{item.lubrifiant_id || "N/A"}</td>
                    <td>{item.nom || "N/A"}</td>
                    <td>{item.type || "N/A"}</td>
                    <td>{item.viscosite || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
