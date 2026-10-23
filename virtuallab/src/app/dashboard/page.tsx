"use client";

import { useState, useEffect } from "react";
import { useUser } from "./layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Users,
  FlaskConical,
  FileText,
  ClipboardList,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  Settings,
  UserCheck,
  Building
} from "lucide-react";
import Link from "next/link";

interface StudentDashboardData {
  completionPercentage: number;
  averageGrade: number;
  experimentCount: number;
  pendingSubmissions: number;
  latestFeedback: {
    text: string;
    experimentName: string;
    score: number;
    date: string;
  } | null;
  activeExperiment: {
    id: string;
    title: string;
    moduleName: string;
    category?: string;
    progress: number;
    deadline?: string | null;
  } | null;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

interface InstructorDashboardData {
  totalStudents: number;
  activeClasses: number;
  averageGrade: number;
  submissionRate: number;
  completionRate: number;
  highestPerformingExperiment: {
    id: string;
    title: string;
    averageGrade: number;
    count: number;
  } | null;
  lowestPerformingExperiment: {
    id: string;
    title: string;
    averageGrade: number;
    count: number;
  } | null;
  recentSubmissions: Array<{
    id: string;
    studentName: string;
    studentNumber?: string;
    experimentTitle: string;
    experimentId: string;
    className: string;
    status: string;
    submittedAt: string;
    grade?: number | null;
  }>;
}

interface AdminDashboardData extends InstructorDashboardData {
  totalUsers: number;
  totalInstructors: number;
  totalClasses: number;
  totalExperiments: number;
  totalSubmissions: number;
  systemAverageGrade: number;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error(`Gagal memuat data: HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error?.message || "Format data tidak valid");
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Terjadi kesalahan saat memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchDashboardData();
    }
  }, [userLoading]);

  const role = user?.role || "STUDENT";
  const name = user?.name || "Pengguna";

  // Helper for formatting relative time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return "Kemarin";
    if (diffDay < 7) return `${diffDay} hari yang lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GRADED":
        return <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200">Dinilai</Badge>;
      case "SUBMITTED":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Diserahkan</Badge>;
      case "READY_TO_SUBMIT":
        return <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">Siap Submit</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Sedang Dikerjakan</Badge>;
      case "RETURNED":
        return <Badge variant="destructive" className="bg-rose-100 text-rose-800 border-rose-200">Perlu Revisi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Skeletons
  if (userLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-xl"></div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white rounded-xl border border-rose-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Gagal Mengambil Data</h2>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================
  if (role === "ADMIN") {
    const adminData = data as AdminDashboardData;
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">Administrator</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Dashboard Administrator</h1>
            <p className="text-slate-500">Ringkasan status sistem, metrik operasional laboratorium, dan manajemen pengguna.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/analytics">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Analitik Detail
              </Link>
            </Button>
            <Button onClick={fetchDashboardData} variant="ghost" size="icon" title="Segarkan Data">
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>

        {/* System-wide stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{adminData?.totalUsers ?? 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                {adminData?.totalStudents ?? 0} Mahasiswa • {adminData?.totalInstructors ?? 0} Instruktur
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Kelas & Praktikum</CardTitle>
              <FlaskConical className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{adminData?.totalClasses ?? 0} Kelas</div>
              <p className="text-xs text-slate-500 mt-1">{adminData?.totalExperiments ?? 0} Eksperimen aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Nilai Rata-rata Sistem</CardTitle>
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{adminData?.systemAverageGrade ?? 0}</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">Skala 0 - 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Tingkat Penyerahan</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{adminData?.submissionRate ?? 0}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, adminData?.submissionRate ?? 0)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/kelas" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mt-3">Manajemen Kelas</h3>
            <p className="text-xs text-slate-500 mt-1">Kelola kelas, pengajar, dan pendaftaran praktikan</p>
          </Link>

          <Link href="/dashboard/praktikum" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mt-3">Modul & Eksperimen</h3>
            <p className="text-xs text-slate-500 mt-1">Konfigurasi instruksi, teori, dan parameter lab</p>
          </Link>

          <Link href="/dashboard/analytics" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mt-3">Statistik & Analitik</h3>
            <p className="text-xs text-slate-500 mt-1">Grafik distribusi nilai, performa, dan kelulusan</p>
          </Link>

          <Link href="/dashboard/submissions" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm transition group">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mt-3">Semua Penyerahan</h3>
            <p className="text-xs text-slate-500 mt-1">Monitor laporan dan status penilaian mahasiswa</p>
          </Link>
        </div>

        {/* Performance Cards & Recent Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Penyerahan Laporan Terbaru</CardTitle>
                  <CardDescription>Laporan praktikum yang baru saja diserahkan mahasiswa</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/submissions">Lihat Semua</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {adminData?.recentSubmissions && adminData.recentSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mahasiswa</TableHead>
                          <TableHead>Praktikum</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminData.recentSubmissions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <div className="font-medium text-slate-900">{sub.studentName}</div>
                              {sub.studentNumber && <div className="text-xs text-slate-500">{sub.studentNumber}</div>}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-slate-800">{sub.experimentTitle}</div>
                              <div className="text-xs text-slate-500">{sub.className}</div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">{formatTimeAgo(sub.submittedAt)}</TableCell>
                            <TableCell>{getStatusBadge(sub.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/dashboard/grading?id=${sub.id}`}>Review</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">Belum ada penyerahan laporan</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sorotan Eksperimen</CardTitle>
                <CardDescription>Performa nilai praktikum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {adminData?.highestPerformingExperiment ? (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Nilai Tertinggi
                      </span>
                      <span className="text-sm font-bold text-emerald-700">
                        Rata-rata: {adminData.highestPerformingExperiment.averageGrade}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 mt-2">{adminData.highestPerformingExperiment.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{adminData.highestPerformingExperiment.count} praktikan telah dinilai</p>
                  </div>
                ) : null}

                {adminData?.lowestPerformingExperiment ? (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Perlu Perhatian
                      </span>
                      <span className="text-sm font-bold text-rose-700">
                        Rata-rata: {adminData.lowestPerformingExperiment.averageGrade}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 mt-2">{adminData.lowestPerformingExperiment.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{adminData.lowestPerformingExperiment.count} praktikan telah dinilai</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // INSTRUCTOR DASHBOARD
  // ==========================================
  if (role === "INSTRUCTOR") {
    const instData = data as InstructorDashboardData;
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Instruktur</h1>
            <p className="text-slate-500 mt-1">Selamat datang kembali, {name}. Berikut rangkuman perkembangan praktikum mahasiswa Anda.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/analytics">
                <BarChart3 className="w-4 h-4" />
                Lihat Analisis Performa
              </Link>
            </Button>
            <Button onClick={fetchDashboardData} variant="outline" size="icon" title="Segarkan Data">
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Mahasiswa</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{instData?.totalStudents ?? 0}</div>
              <p className="text-xs text-slate-500 mt-1">Praktikan terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Kelas Aktif</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{instData?.activeClasses ?? 0}</div>
              <p className="text-xs text-slate-500 mt-1">Kelas yang diampu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Nilai Rata-rata</CardTitle>
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{instData?.averageGrade ?? 0}</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">Skala 0 - 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Submission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{instData?.submissionRate ?? 0}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, instData?.submissionRate ?? 0)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{instData?.completionRate ?? 0}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-teal-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, instData?.completionRate ?? 0)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Highest and Lowest Performing Experiments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> Praktikum Performa Tertinggi
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Rata-rata: {instData?.highestPerformingExperiment?.averageGrade ?? "-"}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2 text-slate-900">
                {instData?.highestPerformingExperiment?.title || "Belum ada data evaluasi"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {instData?.highestPerformingExperiment
                  ? `${instData.highestPerformingExperiment.count} laporan telah dinilai dan menunjukkan penguasaan materi yang tinggi.`
                  : "Data performa akan muncul setelah praktikan mengumpulkan tugas."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" /> Praktikum Perlu Perhatian
                </span>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                  Rata-rata: {instData?.lowestPerformingExperiment?.averageGrade ?? "-"}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2 text-slate-900">
                {instData?.lowestPerformingExperiment?.title || "Belum ada data evaluasi"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {instData?.lowestPerformingExperiment
                  ? `${instData.lowestPerformingExperiment.count} laporan dievaluasi. Perhatikan parameter dan prosedur modul ini.`
                  : "Data evaluasi belum tersedia."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Penyerahan Laporan Terbaru</CardTitle>
              <CardDescription>Daftar penyerahan praktikum yang perlu ditinjau atau baru saja dinilai</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/submissions">Lihat Semua Submissions</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {instData?.recentSubmissions && instData.recentSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahasiswa</TableHead>
                      <TableHead>Eksperimen</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Waktu Kirim</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nilai</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instData.recentSubmissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">{sub.studentName}</div>
                          {sub.studentNumber && <div className="text-xs text-slate-500">{sub.studentNumber}</div>}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">{sub.experimentTitle}</TableCell>
                        <TableCell className="text-slate-500 text-xs">{sub.className}</TableCell>
                        <TableCell className="text-xs text-slate-500">{formatTimeAgo(sub.submittedAt)}</TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {sub.grade !== null && sub.grade !== undefined ? sub.grade : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="hover:text-blue-600">
                            <Link href={`/dashboard/grading?id=${sub.id}`}>Review</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Belum ada laporan yang diserahkan oleh praktikan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // STUDENT DASHBOARD
  // ==========================================
  const studentData = data as StudentDashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Halo, {name}!</h1>
          <p className="text-slate-500">Selamat datang di Laboratorium Virtual Analisis Kimia Terapan.</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm" className="gap-2 shrink-0 self-start md:self-auto">
          <RefreshCw className="w-4 h-4 text-slate-500" /> Segarkan
        </Button>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion % with Progress Bar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Kelulusan Praktikum</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{studentData?.completionPercentage ?? 0}%</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, studentData?.completionPercentage ?? 0)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {studentData?.completionPercentage === 100
                ? "Semua modul telah selesai!"
                : `${studentData?.completionPercentage ?? 0}% dari seluruh modul selesai`}
            </p>
          </CardContent>
        </Card>

        {/* Average Grade */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Nilai Rata-rata</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {studentData?.averageGrade ? `${studentData.averageGrade}` : "-"}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {studentData?.averageGrade && studentData.averageGrade >= 80
                ? "Sangat Baik (Grade A)"
                : studentData?.averageGrade
                ? "Bagus, terus tingkatkan!"
                : "Belum ada nilai terkumpul"}
            </p>
          </CardContent>
        </Card>

        {/* Experiment Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Jumlah Praktikum</CardTitle>
            <FlaskConical className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{studentData?.experimentCount ?? 0}</div>
            <p className="text-xs text-slate-500 mt-2">Eksperimen dalam kelas terdaftar</p>
          </CardContent>
        </Card>

        {/* Pending Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Menunggu Penilaian</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{studentData?.pendingSubmissions ?? 0}</div>
            <p className="text-xs text-slate-500 mt-2">Laporan telah diserahkan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Experiment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Praktikum Aktif</CardTitle>
              <CardDescription>Lanjutkan simulasi laboratorium Anda yang sedang berjalan</CardDescription>
            </CardHeader>
            <CardContent>
              {studentData?.activeExperiment ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {studentData.activeExperiment.category || "Praktikum"}
                      </span>
                      {studentData.activeExperiment.deadline && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Batas: {new Date(studentData.activeExperiment.deadline).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{studentData.activeExperiment.title}</h3>
                    <p className="text-sm text-slate-600">{studentData.activeExperiment.moduleName}</p>

                    <div className="mt-4 pt-2">
                      <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                        <span>Progres Penyelesaian</span>
                        <span className="font-semibold text-blue-700">{studentData.activeExperiment.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${studentData.activeExperiment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="shrink-0 bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Link href={`/dashboard/praktikum?id=${studentData.activeExperiment.id}`}>Lanjutkan</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Tidak ada praktikum aktif saat ini</p>
                  <p className="text-xs text-slate-500 mt-1">Pilih eksperimen baru di menu praktikum</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/dashboard/praktikum">Buka Daftar Praktikum</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Feedback Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Catatan Evaluasi & Umpan Balik Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentData?.latestFeedback ? (
                <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">
                      {studentData.latestFeedback.experimentName}
                    </span>
                    <Badge variant="success" className="bg-emerald-100 text-emerald-800 font-bold">
                      Nilai: {studentData.latestFeedback.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 italic">"{studentData.latestFeedback.text}"</p>
                  <p className="text-xs text-slate-400 text-right">{formatTimeAgo(studentData.latestFeedback.date)}</p>
                </div>
              ) : (
                <div className="text-slate-500 text-sm py-4 text-center">
                  Belum ada umpan balik dari dosen untuk eksperimen yang Anda selesaikan.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terkini</CardTitle>
              <CardDescription>Riwayat interaksi praktikum terbaru Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {studentData?.recentActivity && studentData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {studentData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        {activity.type === "grade" ? (
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                        ) : activity.type === "submission" ? (
                          <FileText className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ClipboardList className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Belum ada catatan aktivitas terkini
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
