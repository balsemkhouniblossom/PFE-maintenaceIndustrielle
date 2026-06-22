"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DynamicSearchControls from "@/components/DynamicSearchControls";
import { apiService } from "@/services/api";
import { ALL_FIELDS_TOKEN, getSearchableFields, matchesDynamicSearch } from "@/services/dynamicSearch";
import { useTranslations } from "next-intl";

interface StockItem {
  _id: string;
  part_id?: string | { _id?: string; part_id?: string; nom_piece?: string };
  quantite_en_stock?: number;
  emplacement?: string;
}

function partLabel(part: StockItem["part_id"]): string {
  if (!part) return "N/A";
  if (typeof part === "string") return part;
  return part.part_id || part.nom_piece || part._id || "N/A";
}

export default function StocksPage() {
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(ALL_FIELDS_TOKEN);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.getStocks();
        setItems(res.data ?? []);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const searchableItems = useMemo(
    () => items.map((item) => ({ ...item, part_label: partLabel(item.part_id) })),
    [items],
  );
  const searchableFields = useMemo(() => getSearchableFields(searchableItems), [searchableItems]);
  const filteredItems = useMemo(
    () => searchableItems.filter((item) => matchesDynamicSearch(item, searchTerm, selectedSearchField)),
    [searchableItems, searchTerm, selectedSearchField],
  );

  return (
    <DashboardLayout title="Stocks">
      <div className="bento-grid">
        <div className="col-span-full panel">
          <div className="flex items-center justify-between mb-3">
            <h2 className="card-title">Stocks</h2>
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
            searchPlaceholder="Search stocks..."
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
                  <th>Part</th>
                  <th>Quantity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{partLabel(item.part_id)}</td>
                    <td>{item.quantite_en_stock ?? 0}</td>
                    <td>{item.emplacement || "N/A"}</td>
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
