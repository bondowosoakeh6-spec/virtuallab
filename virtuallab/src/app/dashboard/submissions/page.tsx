"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileCheck, Search, Eye } from "lucide-react";
import { getStateLabel, getStateColor, ExperimentState } from "@/lib/experiment-state-machine";

interface SubmissionItem {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  student: {
    user: { name: string };
    studentNumber: string;
  };
  experiment: {
    title: string;
  };
  grade?: { total: number } | null;
}

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/submissions");
        const data = await res.json();
        setSubmissions(data.data || []);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const filtered = submissions.filter((s) => {
    const matchSearch = searchTerm === "" ||
      s.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.experiment?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "ALL" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <p className="text-slate-600 mt-1">Daftar pengumpulan praktikum mahasiswa</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari mahasiswa atau praktikum..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-md px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="GRADED">Graded</option>
          <option value="RETURNED">Returned</option>
          <option value="RESUBMITTED">Resubmitted</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileCheck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Belum ada submission.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Mahasiswa</th>
                    <th className="px-6 py-4">Praktikum</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Nilai</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-slate-900">
                            {s.student?.user?.name || "-"}
                          </span>
                          <p className="text-xs text-slate-400">
                            {s.student?.studentNumber || ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{s.experiment?.title || "-"}</td>
                      <td className="px-6 py-4">{formatDate(s.submittedAt || s.createdAt)}</td>
                      <td className="px-6 py-4">
                        <Badge className={getStateColor(s.status as ExperimentState)}>
                          {getStateLabel(s.status as ExperimentState)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {s.grade ? Number(s.grade.total).toFixed(1) : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/grading/${s.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {s.status === "SUBMITTED" || s.status === "RESUBMITTED" ? "Nilai" : "Lihat"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
