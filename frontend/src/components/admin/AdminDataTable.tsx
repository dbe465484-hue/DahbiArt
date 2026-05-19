"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type DataTableTab<T> = {
  id: string;
  label: string;
  match: (row: T) => boolean;
};

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
};

type Props<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getSearchText: (row: T) => string;
  tabs?: DataTableTab<T>[];
  defaultTabId?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  getRowKey: (row: T) => string;
  defaultSortColumn?: string | null;
  defaultSortDir?: "asc" | "desc";
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectedKeysChange?: (keys: Set<string>) => void;
  onFilteredRowsChange?: (rows: T[]) => void;
  headerActions?: ReactNode;
  bulkActions?: ReactNode;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className="ml-1 inline-flex flex-col text-[9px] leading-none text-stone-400">
      <span className={active && dir === "asc" ? "text-sky-600" : ""}>▲</span>
      <span className={active && dir === "desc" ? "text-sky-600" : ""}>▼</span>
    </span>
  );
}

export function AdminDataTable<T>({
  rows,
  columns,
  getSearchText,
  tabs = [],
  defaultTabId = "all",
  searchPlaceholder = "Rechercher…",
  emptyMessage = "Aucun résultat.",
  isLoading = false,
  getRowKey,
  defaultSortColumn = undefined,
  defaultSortDir = "desc",
  selectable = false,
  selectedKeys,
  onSelectedKeysChange,
  onFilteredRowsChange,
  headerActions,
  bulkActions,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(defaultTabId);
  const [sortCol, setSortCol] = useState<string | null>(defaultSortColumn ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of tabs) {
      counts[tab.id] = rows.filter((row) => tab.match(row)).length;
    }
    return counts;
  }, [rows, tabs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeTabDef = tabs.find((t) => t.id === activeTab);

    let list = rows.filter((row) => {
      if (activeTabDef && !activeTabDef.match(row)) return false;
      if (q && !getSearchText(row).toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortCol) {
      const col = columns.find((c) => c.id === sortCol);
      if (col?.sortValue) {
        list = [...list].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv), "fr");
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }

    return list;
  }, [rows, search, activeTab, tabs, sortCol, sortDir, columns, getSearchText]);

  const filteredSignature = useMemo(
    () => filtered.map((row) => getRowKey(row)).join("\0"),
    [filtered, getRowKey],
  );

  const onFilteredRowsChangeRef = useRef(onFilteredRowsChange);
  onFilteredRowsChangeRef.current = onFilteredRowsChange;

  const lastFilteredSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!onFilteredRowsChangeRef.current) return;
    if (lastFilteredSignatureRef.current === filteredSignature) return;
    lastFilteredSignatureRef.current = filteredSignature;
    onFilteredRowsChangeRef.current(filtered);
  }, [filtered, filteredSignature]);

  const allFilteredSelected =
    selectable &&
    filtered.length > 0 &&
    filtered.every((row) => selectedKeys?.has(getRowKey(row)));

  function toggleSelectAll() {
    if (!onSelectedKeysChange) return;
    if (allFilteredSelected) {
      const next = new Set(selectedKeys);
      for (const row of filtered) next.delete(getRowKey(row));
      onSelectedKeysChange(next);
    } else {
      const next = new Set(selectedKeys);
      for (const row of filtered) next.add(getRowKey(row));
      onSelectedKeysChange(next);
    }
  }

  function toggleSelectRow(key: string) {
    if (!onSelectedKeysChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectedKeysChange(next);
  }

  function toggleSort(colId: string, sortable: boolean) {
    if (!sortable) return;
    if (sortCol === colId) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(colId);
      setSortDir("asc");
    }
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-sm">
      <div className="border-b border-stone-100 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="relative min-w-[12rem] flex-1 max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-stone-200 bg-stone-50/80 py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
          {headerActions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div>
          )}
        </div>

        {selectable && selectedKeys && selectedKeys.size > 0 && bulkActions && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
            <span className="text-sm font-medium text-sky-900">
              {selectedKeys.size} sélectionnée{selectedKeys.size > 1 ? "s" : ""}
            </span>
            {bulkActions}
          </div>
        )}

        {tabs.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const count = tabCounts[tab.id] ?? 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active ? "bg-sky-100 text-sky-900" : "bg-white/80 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="px-4 py-16 text-center text-sm text-stone-500">Chargement des données…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-stone-500">{emptyMessage}</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/90 text-xs font-semibold uppercase tracking-wide text-stone-500">
                {selectable && (
                  <th className="w-10 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      aria-label="Tout sélectionner"
                      className="rounded border-stone-300"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const sortable = !!col.sortValue;
                  const active = sortCol === col.id;
                  return (
                    <th
                      key={col.id}
                      className={`px-4 py-3.5 ${col.className ?? ""} ${
                        sortable ? "cursor-pointer select-none hover:bg-stone-100/80" : ""
                      }`}
                      onClick={() => toggleSort(col.id, sortable)}
                    >
                      <span className="inline-flex items-center">
                        {col.header}
                        {sortable && <SortIcon active={active} dir={sortDir} />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((row) => {
                const key = getRowKey(row);
                const selected = selectedKeys?.has(key);
                return (
                <tr
                  key={key}
                  className={`transition hover:bg-sky-50/40 ${selected ? "bg-sky-50/60" : ""}`}
                >
                  {selectable && (
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelectRow(key)}
                        aria-label="Sélectionner la ligne"
                        className="rounded border-stone-300"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={`px-4 py-3.5 align-middle ${col.className ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && filtered.length > 0 && (
        <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-2.5 text-right text-xs text-stone-500">
          {filtered.length} sur {rows.length} affiché{filtered.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
