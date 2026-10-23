"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Submission = {
  id: string;
  status: string;
  createdAt: string;
  experiment: {
    title: string;
  };
  grade: {
    preTest: number;
    practical: number;
    calculation: number;
    report: number;
    postTest: number;
    total: number;
    feedback: string;
  } | null;
};

export default function StudentGradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyGrades();
  }, []);

  const fetchMyGrades = async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        // Assuming API returns all submissions for the logged-in student
        setSubmissions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const gradedSubmissions = submissions.filter(s => s.status === "GRADED" && s.grade);
  const totalGrades = gradedSubmissions.reduce((acc, curr) => acc + (curr.grade?.total || 0), 0);
  const averageGrade = gradedSubmissions.length > 0 ? (totalGrades / gradedSubmissions.length).toFixed(2) : "0.00";

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{averageGrade}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Praktikum Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{gradedSubmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Nilai Praktikum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Praktikum</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Pre-test</TableHead>
                  <TableHead className="text-right">Praktikum</TableHead>
                  <TableHead className="text-right">Perhitungan</TableHead>
                  <TableHead className="text-right">Laporan</TableHead>
                  <TableHead className="text-right">Post-test</TableHead>
                  <TableHead className="text-right font-bold">Total</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Belum ada data praktikum
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium whitespace-nowrap">{sub.experiment.title}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        {sub.status === "GRADED" ? (
                          <Badge className="bg-green-500">Selesai</Badge>
                        ) : sub.status === "SUBMITTED" ? (
                          <Badge variant="secondary">Proses</Badge>
                        ) : (
                          <Badge variant="outline">{sub.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{sub.grade?.preTest || "-"}</TableCell>
                      <TableCell className="text-right">{sub.grade?.practical || "-"}</TableCell>
                      <TableCell className="text-right">{sub.grade?.calculation || "-"}</TableCell>
                      <TableCell className="text-right">{sub.grade?.report || "-"}</TableCell>
                      <TableCell className="text-right">{sub.grade?.postTest || "-"}</TableCell>
                      <TableCell className="text-right font-bold">{sub.grade?.total?.toFixed(2) || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={sub.grade?.feedback}>
                        {sub.grade?.feedback || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
