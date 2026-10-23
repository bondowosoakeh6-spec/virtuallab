"use client";

import { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Users, FlaskConical, FileSpreadsheet } from "lucide-react";

export default function LaporanPage() {
  const { user } = useUser();
  const role = user?.role || "STUDENT";
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data.data || []);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleExport = async (classId: string, format: string) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/reports/export?classId=${classId}&format=${format}`);
      const data = await res.json();

      if (format === "json") {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `laporan-${classId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExcelExport = async (classId: string) => {
    setExportingExcel(classId);
    try {
      const res = await fetch(`/api/reports/excel?classId=${classId}`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Get filename from Content-Disposition header if available
      const disposition = res.headers.get("Content-Disposition");
      let filename = `rekap-kelas-${classId}.xlsx`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export failed", err);
    } finally {
      setExportingExcel(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
          <p className="text-slate-600 mt-1">Laporan dan analisis nilai praktikum</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{classes.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Praktikum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {classes.reduce((sum: number, c: any) => sum + (c._count?.experiments || 0), 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">
                {classes.reduce((sum: number, c: any) => sum + (c._count?.members || 0), 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Ekspor Laporan per Kelas</CardTitle>
          <CardDescription>Unduh rekap penilaian dalam format Excel atau JSON</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 py-4">Memuat data kelas...</p>
          ) : classes.length === 0 ? (
            <p className="text-slate-500 py-4">Belum ada kelas.</p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls: any) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div>
                    <h3 className="font-medium text-slate-900">{cls.name}</h3>
                    <p className="text-sm text-slate-500">
                      {cls.code} • {cls._count?.members || 0} mahasiswa • {cls._count?.experiments || 0} praktikum
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleExcelExport(cls.id)}
                      disabled={exportingExcel === cls.id}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      {exportingExcel === cls.id ? "Mengunduh..." : "Export Excel"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(cls.id, "json")}
                      disabled={exporting}
                      className="gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export JSON
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
