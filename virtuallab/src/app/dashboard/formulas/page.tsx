"use client";

import { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Eye,
  Edit,
  History,
  X,
  Lock,
  Unlock,
  Save,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface FormulaVersion {
  id: string;
  version: number;
  expression: string;
  sourceCell: string | null;
  sourceFormula: string | null;
  createdAt: string;
}

interface Formula {
  id: string;
  code: string;
  name: string;
  description: string | null;
  expression: string;
  unit: string | null;
  sourceFile: string | null;
  sourceSheet: string | null;
  sourceCell: string | null;
  isSystem: boolean;
  isActive: boolean;
  moduleId: string;
  module: { id: string; name: string; category: string | null };
  versions: FormulaVersion[];
  latestVersion: FormulaVersion | null;
  versionCount: number;
  accessLevel: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FormulaManagementPage() {
  const { user, loading: userLoading } = useUser();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterSystem, setFilterSystem] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", expression: "", unit: "" });
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<FormulaVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const role = user?.role || "STUDENT";

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterSystem) params.set("isSystem", filterSystem);
      const res = await fetch(`/api/formulas?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("Anda tidak memiliki akses ke halaman ini.");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setFormulas(json.data || []);
      } else {
        throw new Error(json.error?.message || "Gagal memuat formula");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (formulaId: string) => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/formulas/${formulaId}/versions`);
      if (res.ok) {
        const json = await res.json();
        setVersions(json.data?.versions || []);
      }
    } catch (err) {
      console.error("Failed to fetch versions:", err);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && role !== "STUDENT") {
      fetchFormulas();
    }
  }, [userLoading, filterSystem]);

  const handleSearch = () => {
    fetchFormulas();
  };

  // ============================================================
  // EDIT / SAVE
  // ============================================================

  const openEdit = (formula: Formula) => {
    setEditingFormula(formula);
    setEditForm({
      name: formula.name,
      description: formula.description || "",
      expression: formula.expression,
      unit: formula.unit || "",
    });
    fetchVersions(formula.id);
  };

  const closeEdit = () => {
    setEditingFormula(null);
    setVersions([]);
  };

  const handleSave = async () => {
    if (!editingFormula) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/formulas/${editingFormula.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        alert(editingFormula.isSystem
          ? "Formula berhasil diperbarui! Versi baru telah dibuat."
          : "Formula berhasil diperbarui!");
        closeEdit();
        fetchFormulas();
      } else {
        const json = await res.json();
        alert(json.error?.message || "Gagal menyimpan formula");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setVersions([]);
    } else {
      setExpandedId(id);
      fetchVersions(id);
    }
  };

  // ============================================================
  // STUDENT ACCESS DENIED
  // ============================================================

  if (role === "STUDENT") {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">NO ACCESS</h2>
        <p className="text-slate-500 text-sm max-w-md text-center">
          Mahasiswa tidak memiliki akses ke halaman manajemen formula. Hubungi administrator jika Anda memerlukan informasi formula.
        </p>
      </div>
    );
  }

  // ============================================================
  // LOADING / ERROR
  // ============================================================

  if (userLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl"></div>
        <div className="h-12 bg-slate-200 rounded-xl"></div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white rounded-xl border border-rose-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Gagal Memuat Data</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Button onClick={fetchFormulas} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  // ============================================================
  // ACCESS LEVEL BADGES
  // ============================================================

  const getAccessBadge = () => {
    if (role === "ADMIN") {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">CONTROLLED UPDATE</Badge>;
    }
    if (role === "INSTRUCTOR") {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">READ ONLY</Badge>;
    }
    return null;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Formula</h1>
            {getAccessBadge()}
          </div>
          <p className="text-slate-500 mt-1">
            {role === "ADMIN"
              ? "Kelola formula kalkulasi laboratorium. Formula sistem menggunakan versioning (immutable)."
              : "Lihat formula kalkulasi laboratorium. Akses hanya baca (read-only)."}
          </p>
        </div>
        <Button onClick={fetchFormulas} variant="outline" size="icon" title="Segarkan">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari formula berdasarkan kode atau nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
            >
              <option value="">Semua Tipe</option>
              <option value="true">System Formula</option>
              <option value="false">Custom Formula</option>
            </select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" /> Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formula Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Formula ({formulas.length})</CardTitle>
          <CardDescription>
            Formula kalkulasi yang digunakan dalam eksperimen laboratorium
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formulas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Tidak ada formula yang ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Kode Formula</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Ekspresi</TableHead>
                    <TableHead>Source Workbook</TableHead>
                    <TableHead>Sheet</TableHead>
                    <TableHead>Cell</TableHead>
                    <TableHead>Versi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formulas.map((formula) => (
                    <>
                      <TableRow key={formula.id} className="group">
                        <TableCell>
                          <button
                            onClick={() => toggleExpand(formula.id)}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            {expandedId === formula.id
                              ? <ChevronDown className="w-4 h-4 text-slate-500" />
                              : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </button>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs rounded font-mono">
                            {formula.code}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{formula.name}</TableCell>
                        <TableCell>
                          <span
                            className="text-xs font-mono text-slate-600 max-w-[200px] truncate block"
                            title={formula.expression}
                          >
                            {formula.expression.length > 40
                              ? formula.expression.substring(0, 40) + "..."
                              : formula.expression}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {formula.sourceFile || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {formula.sourceSheet || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-slate-500">
                            {formula.sourceCell || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-slate-700">
                            v{formula.latestVersion?.version || 1}
                          </span>
                          {formula.versionCount > 1 && (
                            <span className="text-xs text-slate-400 ml-1">
                              ({formula.versionCount})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {formula.isSystem ? (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">
                                <Lock className="w-3 h-3 mr-1" /> SYSTEM
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                                <Unlock className="w-3 h-3 mr-1" /> CUSTOM
                              </Badge>
                            )}
                            {formula.isActive ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                                ACTIVE
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px]">
                                INACTIVE
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(formula.id)}
                              className="gap-1 text-slate-600"
                            >
                              <History className="w-4 h-4" />
                              <span className="hidden sm:inline">Versi</span>
                            </Button>
                            {role === "ADMIN" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(formula)}
                                className="gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" /> Edit
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(formula)}
                                className="gap-1 text-slate-600"
                              >
                                <Eye className="w-4 h-4" /> Lihat
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Version History Row */}
                      {expandedId === formula.id && (
                        <TableRow key={`${formula.id}-versions`}>
                          <TableCell colSpan={10} className="bg-slate-50 p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                                <History className="w-4 h-4" /> Riwayat Versi — {formula.code}
                              </h4>
                              {versionsLoading ? (
                                <p className="text-sm text-slate-500">Memuat versi...</p>
                              ) : versions.length === 0 ? (
                                <p className="text-sm text-slate-500">Belum ada riwayat versi</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 px-3 font-medium text-slate-600">Versi</th>
                                        <th className="text-left py-2 px-3 font-medium text-slate-600">Ekspresi</th>
                                        <th className="text-left py-2 px-3 font-medium text-slate-600">Source Cell</th>
                                        <th className="text-left py-2 px-3 font-medium text-slate-600">Tanggal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {versions.map((v) => (
                                        <tr key={v.id} className="border-b border-slate-100">
                                          <td className="py-2 px-3">
                                            <Badge variant="outline" className="font-mono text-xs">
                                              v{v.version}
                                            </Badge>
                                          </td>
                                          <td className="py-2 px-3">
                                            <code className="text-xs font-mono text-slate-700 break-all">
                                              {v.expression}
                                            </code>
                                          </td>
                                          <td className="py-2 px-3 text-xs text-slate-500 font-mono">
                                            {v.sourceCell || "-"}
                                          </td>
                                          <td className="py-2 px-3 text-xs text-slate-500">
                                            {new Date(v.createdAt).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/View Modal */}
      {editingFormula && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {role === "ADMIN" ? "Edit Formula" : "Detail Formula"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                    {editingFormula.code}
                  </code>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {editingFormula.isSystem ? (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">SYSTEM FORMULA</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">CUSTOM FORMULA</Badge>
                )}
                <button onClick={closeEdit} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Immutability Warning */}
              {editingFormula.isSystem && role === "ADMIN" && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">SYSTEM FORMULA — Perubahan akan membuat versi baru</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Formula ini berasal dari workbook. Perubahan pada ekspresi tidak akan menimpa versi sebelumnya,
                      melainkan membuat versi baru secara otomatis.
                    </p>
                  </div>
                </div>
              )}

              {role === "INSTRUCTOR" && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">READ ONLY</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Instruktur hanya dapat melihat formula. Hubungi administrator untuk melakukan perubahan.
                    </p>
                  </div>
                </div>
              )}

              {/* Source Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-xs text-slate-500">Source Workbook</Label>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {editingFormula.sourceFile || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Source Sheet</Label>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {editingFormula.sourceSheet || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Source Cell</Label>
                  <p className="text-sm font-mono font-medium text-slate-800 mt-1">
                    {editingFormula.sourceCell || "-"}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Formula</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                    disabled={role !== "ADMIN"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                    disabled={role !== "ADMIN"}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ekspresi Formula</Label>
                  <Textarea
                    value={editForm.expression}
                    onChange={(e) => setEditForm(f => ({ ...f, expression: e.target.value }))}
                    disabled={role !== "ADMIN"}
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={editForm.unit}
                    onChange={(e) => setEditForm(f => ({ ...f, unit: e.target.value }))}
                    disabled={role !== "ADMIN"}
                    placeholder="e.g. %, mg/L, mol"
                  />
                </div>
              </div>

              {/* Version History in Modal */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                  <History className="w-4 h-4" /> Riwayat Versi
                </h3>
                {versionsLoading ? (
                  <p className="text-sm text-slate-500">Memuat...</p>
                ) : versions.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada riwayat versi</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-slate-600 text-xs">Versi</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-600 text-xs">Ekspresi</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-600 text-xs">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map((v) => (
                          <tr key={v.id} className="border-t border-slate-100">
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="font-mono text-[10px]">v{v.version}</Badge>
                            </td>
                            <td className="py-2 px-3">
                              <code className="text-xs font-mono text-slate-700 break-all">{v.expression}</code>
                            </td>
                            <td className="py-2 px-3 text-xs text-slate-500 whitespace-nowrap">
                              {new Date(v.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-slate-50">
              <Button variant="outline" onClick={closeEdit}>
                {role === "ADMIN" ? "Batal" : "Tutup"}
              </Button>
              {role === "ADMIN" && (
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : editingFormula.isSystem ? "Simpan (Versi Baru)" : "Simpan"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
