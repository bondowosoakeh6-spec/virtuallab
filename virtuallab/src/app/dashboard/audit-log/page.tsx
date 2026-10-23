"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  Clock,
  User,
  Activity,
} from "lucide-react";
import Link from "next/link";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Masuk Sistem",
  LOGOUT: "Keluar Sistem",
  CREATE_CLASS: "Buat Kelas",
  JOIN_CLASS: "Gabung Kelas",
  CREATE_EXPERIMENT: "Buat Eksperimen",
  START_EXPERIMENT: "Mulai Eksperimen",
  CALCULATE: "Hitung",
  SAVE_SESSION: "Simpan Sesi",
  SUBMIT: "Kumpulkan Laporan",
  GRADE: "Beri Nilai",
  FEEDBACK: "Beri Umpan Balik",
  EXPORT_REPORT: "Ekspor Laporan",
  CHANGE_FORMULA: "Ubah Formula",
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-800 border-green-200",
  LOGOUT: "bg-slate-100 text-slate-700 border-slate-200",
  CREATE_CLASS: "bg-blue-100 text-blue-800 border-blue-200",
  JOIN_CLASS: "bg-cyan-100 text-cyan-800 border-cyan-200",
  CREATE_EXPERIMENT: "bg-purple-100 text-purple-800 border-purple-200",
  START_EXPERIMENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  CALCULATE: "bg-amber-100 text-amber-800 border-amber-200",
  SAVE_SESSION: "bg-teal-100 text-teal-800 border-teal-200",
  SUBMIT: "bg-emerald-100 text-emerald-800 border-emerald-200",
  GRADE: "bg-orange-100 text-orange-800 border-orange-200",
  FEEDBACK: "bg-rose-100 text-rose-800 border-rose-200",
  EXPORT_REPORT: "bg-sky-100 text-sky-800 border-sky-200",
  CHANGE_FORMULA: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function AuditLogPage() {
  const { user } = useUser();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  // Available actions for dropdown
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (actionFilter) params.set("action", actionFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/audit-log?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Akses ditolak. Halaman ini hanya untuk Administrator.");
        }
        throw new Error(`HTTP error ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
        setTotal(json.meta?.total || 0);
        setTotalPages(json.meta?.totalPages || 1);
        if (json.meta?.availableActions) {
          setAvailableActions(json.meta.availableActions);
        }
      } else {
        throw new Error(json.error?.message || "Gagal memuat data");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setActionFilter("");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatMetadata = (metadata: any): string => {
    if (!metadata) return "-";
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    } catch {
      return String(metadata);
    }
  };

  // Access check
  if (user && user.role !== "ADMIN") {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white rounded-xl border border-rose-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Akses Ditolak</h2>
        <p className="text-sm text-slate-500">Halaman audit log hanya dapat diakses oleh Administrator.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/dashboard" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <span>›</span>
          <span className="text-slate-700 font-medium">Audit Log</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
              Audit Log
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Riwayat aktivitas pengguna di seluruh sistem VirtualLab ({total} catatan)
            </p>
          </div>
          <Button onClick={fetchLogs} variant="outline" size="sm" className="gap-2 self-start">
            <RefreshCw className="w-4 h-4" /> Segarkan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" /> Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Action filter */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Aksi</label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Semua Aksi</option>
                {(availableActions.length > 0 ? availableActions : Object.keys(ACTION_LABELS)).map((a) => (
                  <option key={a} value={a}>
                    {ACTION_LABELS[a] || a}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Cari aksi, entitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Dari Tanggal</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Sampai Tanggal</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <Button onClick={handleReset} variant="ghost" size="sm" className="text-slate-500 h-9">
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500">Memuat audit log...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-sm text-rose-600">{error}</p>
              <Button onClick={fetchLogs} variant="outline" size="sm">
                Coba Lagi
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              Tidak ada catatan audit log yang ditemukan.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Waktu</TableHead>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Aksi</TableHead>
                      <TableHead>Entitas</TableHead>
                      <TableHead>ID Entitas</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatTimestamp(log.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div>
                              <div className="font-medium text-slate-900 text-sm">{log.user.name}</div>
                              <div className="text-xs text-slate-500">{log.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Sistem</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-700"}`}
                          >
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{log.entity}</TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {log.entityId ? (log.entityId.length > 12 ? log.entityId.substring(0, 12) + "..." : log.entityId) : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                          {formatMetadata(log.metadata)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <p className="text-xs text-slate-500">
                  Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} catatan
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <span className="text-sm font-medium text-slate-700 px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
