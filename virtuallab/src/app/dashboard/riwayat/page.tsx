"use client";

import { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FlaskConical, Calendar, CheckCircle2, Clock } from "lucide-react";
import { getStateLabel, getStateColor, ExperimentState } from "@/lib/experiment-state-machine";

interface HistoryEntry {
  id: string;
  experiment: {
    title: string;
    module: { name: string };
  };
  status: string;
  submittedAt: string | null;
  createdAt: string;
  grade?: {
    total: number;
    feedback: string | null;
  } | null;
}

export default function RiwayatPage() {
  const { user } = useUser();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/submissions");
        const data = await res.json();
        setHistory(data.data || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Praktikum</h1>
        <p className="text-slate-600 mt-1">Catatan seluruh aktivitas praktikum Anda</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat riwayat...</div>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Belum ada riwayat praktikum.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => {
            const stateKey = entry.status as ExperimentState;
            return (
              <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <FlaskConical className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {entry.experiment?.title || "Praktikum"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(entry.submittedAt || entry.createdAt)}
                          </span>
                          {entry.experiment?.module && (
                            <span>{entry.experiment.module.name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {entry.grade && (
                        <div className="text-right">
                          <span className="text-lg font-bold text-slate-900">
                            {Number(entry.grade.total).toFixed(1)}
                          </span>
                          <span className="text-sm text-slate-500 ml-1">/ 100</span>
                        </div>
                      )}
                      <Badge className={getStateColor(stateKey)}>
                        {getStateLabel(stateKey)}
                      </Badge>
                    </div>
                  </div>

                  {entry.grade?.feedback && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Feedback:</span> {entry.grade.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
