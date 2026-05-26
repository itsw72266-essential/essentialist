"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCcw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import SummaryApi from "@/backend/contracts/summaryApi";
import Axios from "@/lib/apiClient";
import AxiosToastError from "@/lib/axiosToastError";

const ENTITIES = [
  { value: "products", label: "Products" },
  { value: "brands", label: "Brands" },
  { value: "categories", label: "Categories" },
  { value: "subcategories", label: "Subcategories" },
  { value: "blogs", label: "Blog posts" },
];

function StatCard({ label, total, needsSync }) {
  const pct = total > 0 ? Math.round(((total - needsSync) / total) * 100) : 100;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{pct}%</div>
      <div className="mt-1 text-sm text-slate-600">
        {needsSync} missing / {total} total
      </div>
    </div>
  );
}

export default function FrenchTranslationsPage() {
  const [entity, setEntity] = useState("products");
  const [field, setField] = useState("name");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const [payload, setPayload] = useState(null);

  const limit = 50;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.i18n.missing,
        params: {
          entity,
          field,
          search: search.trim(),
          limit,
          skip: page * limit,
        },
      });
      if (response?.data?.success) {
        setPayload(response.data.data);
      } else {
        toast.error(response?.data?.message || "Could not load missing translations");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  }, [entity, field, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = payload?.summary;
  const geminiEnabled = summary?.enabled === true;
  const total = payload?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const entityStats = useMemo(() => {
    if (!summary?.entities) return [];
    return ENTITIES.map(({ value, label }) => ({
      key: value,
      label,
      ...(summary.entities[value] || { total: 0, needsSync: 0 }),
    }));
  }, [summary]);

  const runBackfill = async () => {
    if (!geminiEnabled) {
      toast.error("GEMINI_API_KEY is not set on the server");
      return;
    }
    try {
      setBackfilling(true);
      const response = await Axios({
        ...SummaryApi.i18n.backfill,
        data: {
          entities: [entity],
          batchSize: 25,
          onlyMissing: true,
        },
      });
      if (response?.data?.success) {
        toast.success(response.data.message || "Batch complete");
        await load();
      } else {
        toast.error(response?.data?.message || "Backfill failed");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">French translations</h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Catalog French names come from <code className="text-xs bg-slate-100 px-1 rounded">translations.fr</code> in
            MongoDB. UI labels use locale JSON files. Missing rows fall back to English on{" "}
            <code className="text-xs bg-slate-100 px-1 rounded">/fr</code> pages.
          </p>
          {payload?.hint && (
            <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
              {payload.hint}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>
          <button
            type="button"
            onClick={runBackfill}
            disabled={backfilling || !geminiEnabled}
            title={geminiEnabled ? "Translate up to 25 rows for this entity" : "Set GEMINI_API_KEY on the server"}
            className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
          >
            {backfilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Translate next batch
          </button>
        </div>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {entityStats.map((row) => (
            <StatCard
              key={row.key}
              label={row.label}
              total={row.total}
              needsSync={row.needsSync}
            />
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Entity</span>
          <select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(0);
            }}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {ENTITIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Missing field</span>
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setPage(0);
            }}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Any field</option>
            {(payload?.translatableFields || []).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex-1 min-w-[12rem]">
          <span className="block text-slate-600 mb-1">Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(0);
                load();
              }
            }}
            placeholder="Name, slug, or id"
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setPage(0);
            load();
          }}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Apply filters
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          {loading ? "Loading…" : `${total} row(s) missing French`}
          {summary && (
            <span className="ml-2 text-xs">
              · Auto-translate: {geminiEnabled ? `on (${summary.model})` : "off"}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Label</th>
                <th className="px-4 py-2 font-medium">Slug</th>
                <th className="px-4 py-2 font-medium">Missing fields</th>
                <th className="px-4 py-2 font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {!loading && (!payload?.items?.length) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No rows match — French is complete for this filter.
                  </td>
                </tr>
              )}
              {payload?.items?.map((row) => (
                <tr key={row._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-medium text-slate-900">{row.label}</td>
                  <td className="px-4 py-2 text-slate-600 font-mono text-xs">{row.slug || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{row.missingFields?.join(", ")}</td>
                  <td className="px-4 py-2">
                    {row.editHref ? (
                      <Link
                        href={row.editHref}
                        className="text-pink-700 hover:underline"
                      >
                        Open admin
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > limit && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-sm">
            <button
              type="button"
              disabled={page <= 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-pink-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-slate-600">
              Page {page + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page + 1 >= pageCount || loading}
              onClick={() => setPage((p) => p + 1)}
              className="text-pink-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        CLI: <code className="bg-slate-100 px-1 rounded">pnpm list:missing-fr</code> ·{" "}
        <code className="bg-slate-100 px-1 rounded">pnpm backfill:fr</code> · See{" "}
        <code className="bg-slate-100 px-1 rounded">client/docs/french-translations.md</code>
      </p>
    </div>
  );
}
