"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GradingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  const [grades, setGrades] = useState({
    preTest: 0,
    practical: 0,
    calculation: 0,
    report: 0,
    postTest: 0,
  });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchSubmission();
  }, [params.id]);

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/submissions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        const sub = data.data;
        setSubmission(sub);
        if (sub.grade) {
          setGrades({
            preTest: sub.grade.preTest || 0,
            practical: sub.grade.practical || 0,
            calculation: sub.grade.calculation || 0,
            report: sub.grade.report || 0,
            postTest: sub.grade.postTest || 0,
          });
          setFeedback(sub.grade.feedback || "");
        }
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return (
      (grades.preTest * 0.15) +
      (grades.practical * 0.25) +
      (grades.calculation * 0.25) +
      (grades.report * 0.20) +
      (grades.postTest * 0.15)
    ).toFixed(2);
  };

  const handleGradeChange = (field: keyof typeof grades, value: string) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setGrades(prev => ({ ...prev, [field]: num }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const total = Number(calculateTotal());
      const res = await fetch(`/api/submissions/${params.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...grades,
          total,
          feedback,
          status: "GRADED"
        }),
      });

      if (res.ok) {
        alert("Nilai berhasil disimpan!");
        router.push("/dashboard/grading");
      } else {
        alert("Gagal menyimpan nilai");
      }
    } catch (error) {
      console.error("Error submitting grades:", error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Memuat data...</div>;
  }

  if (!submission) {
    return <div className="container mx-auto py-8 text-center">Data tidak ditemukan</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold border-b pb-4">Penilaian Praktikum</CardTitle>
          <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-500">Mahasiswa:</span>
              <p className="text-lg">{submission.user?.name}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500">Praktikum:</span>
              <p className="text-lg">{submission.experiment?.title}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Komponen Nilai</h3>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label>Pre-test (15%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={grades.preTest}
                onChange={(e) => handleGradeChange("preTest", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 items-center gap-4">
              <Label>Praktikum (25%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={grades.practical}
                onChange={(e) => handleGradeChange("practical", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label>Perhitungan (25%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={grades.calculation}
                onChange={(e) => handleGradeChange("calculation", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label>Laporan (20%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={grades.report}
                onChange={(e) => handleGradeChange("report", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 items-center gap-4">
              <Label>Post-test (15%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={grades.postTest}
                onChange={(e) => handleGradeChange("postTest", e.target.value)}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg mt-6 flex justify-between items-center">
            <span className="text-lg font-bold">TOTAL NILAI</span>
            <span className="text-2xl font-bold text-primary">{calculateTotal()}</span>
          </div>

          <div className="space-y-2 mt-6">
            <Label>Feedback untuk Mahasiswa</Label>
            <Textarea
              placeholder="Tuliskan feedback atau catatan perbaikan..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "SIMPAN NILAI"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
