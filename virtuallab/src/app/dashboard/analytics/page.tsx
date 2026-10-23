"use client";

import { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  FlaskConical,
  RefreshCw,
  Filter,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

type TabType = "grade_distribution" | "experiment_completion" | "student_progress" | "class_average" | "experiment_average";

export default function AnalyticsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("grade_distribution");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [classesList, setClassesList] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (type: TabType, classId: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/dashboard/analytics?type=${type}${classId && classId !== "all" ? `&classId=${classId}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (json.data.classes && json.data.classes.length > 0) {
          setClassesList(json.data.classes);
        }
      } else {
        throw new Error(json.error?.message || "Format data tidak valid");
      }
    } catch (err: any) {
      console.error("Fetch analytics error:", err);
      setError(err.message || "Gagal memuat data analitik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(activeTab, selectedClass);
  }, [activeTab, selectedClass]);

  const tabs: Array<{ id: TabType; label: string; icon: any; desc: string }> = [
    {
      id: "grade_distribution",
      label: "Distribusi Nilai",
      icon: Award,
      desc: "Sebaran nilai akhir praktikum mahasiswa dalam rentang grade",
    },
    {
      id: "experiment_completion",
      label: "Kelulusan Eksperimen",
      icon: CheckCircle2,
      desc: "Tingkat persentase penyelesaian setiap modul laboratorium",
    },
    {
      id: "student_progress",
      label: "Progres Mahasiswa",
      icon: Users,
      desc: "Tabel kemajuan individu praktikan dan tren skor mingguan",
    },
    {
      id: "class_average",
      label: "Rata-rata Kelas",
      icon: BookOpen,
      desc: "Perbandingan performa nilai rata-rata antar kelas laboratorium",
    },
    {
      id: "experiment_average",
      label: "Rata-rata Eksperimen",
      icon: FlaskConical,
      desc: "Rata-rata nilai evaluasi pada masing-masing judul eksperimen",
    },
  ];

  const barColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Analitik Performa</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Analisis Performa Laboratorium</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Visualisasi data statistik nilai, penyelesaian praktikum, dan performa per kelas.
          </p>
        </div>

        {/* Controls: Class filter + Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <label htmlFor="class-select" className="text-xs font-medium text-slate-600 shrink-0">
              Filter Kelas:
            </label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer pr-2"
            >
              <option value="all">Semua Kelas</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.code ? `(${c.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => fetchAnalytics(activeTab, selectedClass)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                {tabs.find((t) => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                {tabs.find((t) => t.id === activeTab)?.desc}
              </CardDescription>
            </div>
            {selectedClass !== "all" && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 self-start sm:self-auto">
                Filter: {classesList.find((c) => c.id === selectedClass)?.name || selectedClass}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500">Memuat visualisasi grafik...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-sm text-rose-600">{error}</p>
              <Button onClick={() => fetchAnalytics(activeTab, selectedClass)} variant="outline" size="sm">
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div className="pt-2">
              {/* TAB 1: GRADE DISTRIBUTION */}
              {activeTab === "grade_distribution" && (
                <div className="space-y-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data?.distribution || []}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [`${value} Mahasiswa`, "Jumlah"]}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                          {(data?.distribution || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
                    {(data?.distribution || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg text-center">
                        <span className="text-xs font-semibold text-slate-500 block">{item.range}</span>
                        <span className="text-xl font-bold text-slate-900 mt-1 block">{item.count}</span>
                        <span className="text-[11px] text-slate-400">Mahasiswa</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: EXPERIMENT COMPLETION */}
              {activeTab === "experiment_completion" && (
                <div className="space-y-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data?.completion || []}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value}%`, "Tingkat Kelulusan"]}
                        />
                        <Bar dataKey="completionRate" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Eksperimen</TableHead>
                          <TableHead className="text-center">Selesai</TableHead>
                          <TableHead className="text-center">Total Praktikan</TableHead>
                          <TableHead className="text-right">Persentase</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.completion || []).map((exp: any) => (
                          <TableRow key={exp.id}>
                            <TableCell className="font-medium text-slate-900">{exp.fullName}</TableCell>
                            <TableCell className="text-center">{exp.completed}</TableCell>
                            <TableCell className="text-center">{exp.total}</TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                {exp.completionRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB 3: STUDENT PROGRESS (TABLE + LINE CHART) */}
              {activeTab === "student_progress" && (
                <div className="space-y-8">
                  {/* Line Chart: Progression trend */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Tren Rata-rata Skor Mingguan
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data?.trend || []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[60, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderColor: "#e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            name="Rata-rata Skor"
                            dataKey="averageScore"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            name="Persentase Selesai (%)"
                            dataKey="completionPct"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Student Table */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Daftar Kemajuan Individu Praktikan
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mahasiswa</TableHead>
                            <TableHead>NIM</TableHead>
                            <TableHead className="text-center">Modul Selesai</TableHead>
                            <TableHead className="text-center">Nilai Rata-rata</TableHead>
                            <TableHead className="text-right">Progres Keseluruhan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(data?.students || []).map((s: any) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium text-slate-900">{s.studentName}</TableCell>
                              <TableCell className="text-xs text-slate-500">{s.studentNumber || "-"}</TableCell>
                              <TableCell className="text-center font-medium">{s.completedCount} Modul</TableCell>
                              <TableCell className="text-center">
                                <span className={`font-bold ${s.averageGrade >= 80 ? "text-emerald-600" : "text-slate-800"}`}>
                                  {s.averageGrade || "-"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-24 bg-slate-100 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${s.progressRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">
                                    {s.progressRate}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CLASS AVERAGE */}
              {activeTab === "class_average" && (
                <div className="space-y-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data?.classAverages || []}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value} / 100`, "Nilai Rata-rata"]}
                        />
                        <Bar dataKey="averageScore" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                          {(data?.classAverages || []).map((_: any, index: number) => (
                            <Cell key={`class-cell-${index}`} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Kelas</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead className="text-center">Jumlah Praktikan</TableHead>
                          <TableHead className="text-right">Nilai Rata-rata</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.classAverages || []).map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                            <TableCell className="text-slate-500 text-xs font-mono">{c.code || "-"}</TableCell>
                            <TableCell className="text-center">{c.studentCount} Orang</TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-slate-900 px-2.5 py-1 rounded bg-slate-100">
                                {c.averageScore}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB 5: EXPERIMENT AVERAGE */}
              {activeTab === "experiment_average" && (
                <div className="space-y-6">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data?.experimentAverages || []}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value} / 100`, "Rata-rata Skor"]}
                        />
                        <Bar dataKey="averageScore" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                          {(data?.experimentAverages || []).map((_: any, index: number) => (
                            <Cell key={`exp-cell-${index}`} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Judul Eksperimen</TableHead>
                          <TableHead className="text-center">Total Laporan Dinilai</TableHead>
                          <TableHead className="text-right">Rata-rata Skor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.experimentAverages || []).map((e: any) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium text-slate-900">{e.fullName}</TableCell>
                            <TableCell className="text-center">{e.submissionsCount}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-slate-900 px-2.5 py-1 rounded bg-slate-100">
                                {e.averageScore}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
