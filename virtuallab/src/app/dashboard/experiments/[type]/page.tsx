"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowLeft, FlaskConical, Download } from "lucide-react";

const EXPERIMENT_LABELS: Record<string, string> = {
  KADAR_AIR: "Kadar Air (Moisture Content)",
  KADAR_ABU: "Kadar Abu (Ash Content)",
  KADAR_PROTEIN: "Kadar Protein (Kjeldahl)",
  KADAR_PROTEIN_STANDARLESS: "Kadar Protein (Tanpa Standarisasi)",
  KARBOHIDRAT: "Karbohidrat (Luff Schoorl)",
  KARBOHIDRAT_V2: "Karbohidrat v2 (Luff Schoorl)",
  MOLAR_MASS: "Massa Molar",
  EQUIVALENT_WEIGHT: "Bobot Ekuivalen",
  STANDARDISASI: "Standardisasi",
  STANDARDISASI_KADAR: "Standardisasi & Kadar",
  PENETAPAN_KADAR: "Penetapan Kadar",
  TITRATION_CURVE: "Kurva Titrasi",
};

interface FormField {
  name: string;
  label: string;
  type?: string;
  step?: string;
  placeholder?: string;
}

const FORM_FIELDS: Record<string, FormField[]> = {
  KADAR_AIR: [
    { name: "bobot_wadah_kosong", label: "Bobot Wadah Kosong (g)", step: "0.0001", placeholder: "25.3420" },
    { name: "bobot_sampel", label: "Bobot Sampel (g)", step: "0.0001", placeholder: "2.0015" },
    { name: "bobot_setelah", label: "Bobot Setelah Pemanasan (g)", step: "0.0001", placeholder: "27.1230" },
  ],
  KADAR_ABU: [
    { name: "bobot_wadah_kosong", label: "Bobot Wadah Kosong (g)", step: "0.0001", placeholder: "20.0120" },
    { name: "bobot_cawan_sampel", label: "Bobot Cawan + Sampel (g)", step: "0.0001", placeholder: "22.5430" },
    { name: "bobot_setelah", label: "Bobot Setelah Pengabuan (g)", step: "0.0001", placeholder: "20.2610" },
  ],
  KADAR_PROTEIN: [
    { name: "std_simplo_awal", label: "Std: Volume Simplo Awal (mL)", step: "0.01" },
    { name: "std_simplo_akhir", label: "Std: Volume Simplo Akhir (mL)", step: "0.01" },
    { name: "std_duplo_awal", label: "Std: Volume Duplo Awal (mL)", step: "0.01" },
    { name: "std_duplo_akhir", label: "Std: Volume Duplo Akhir (mL)", step: "0.01" },
    { name: "volume_y", label: "Volume Y (mL)", step: "0.01" },
    { name: "konsentrasi_y", label: "Konsentrasi Y (N)", step: "0.001" },
    { name: "blanko_simplo_awal", label: "Blanko: Simplo Awal (mL)", step: "0.01" },
    { name: "blanko_simplo_akhir", label: "Blanko: Simplo Akhir (mL)", step: "0.01" },
    { name: "blanko_duplo_awal", label: "Blanko: Duplo Awal (mL)", step: "0.01" },
    { name: "blanko_duplo_akhir", label: "Blanko: Duplo Akhir (mL)", step: "0.01" },
    { name: "sample_simplo_awal", label: "Sampel: Simplo Awal (mL)", step: "0.01" },
    { name: "sample_simplo_akhir", label: "Sampel: Simplo Akhir (mL)", step: "0.01" },
    { name: "sample_duplo_awal", label: "Sampel: Duplo Awal (mL)", step: "0.01" },
    { name: "sample_duplo_akhir", label: "Sampel: Duplo Akhir (mL)", step: "0.01" },
    { name: "konsentrasi_penitar", label: "Konsentrasi Penitar (N)", step: "0.001", placeholder: "0.1" },
    { name: "ketetapan_protein", label: "Ar Nitrogen", step: "0.001", placeholder: "14.007" },
    { name: "faktor_pengenceran", label: "Faktor Pengenceran", step: "1", placeholder: "1" },
    { name: "massa_sampel", label: "Massa Sampel (mg)", step: "0.1", placeholder: "500" },
    { name: "jenis_sampel", label: "Jenis Sampel", type: "text", placeholder: "Tahu" },
  ],
  MOLAR_MASS: [
    { name: "el1_symbol", label: "Unsur 1 - Simbol", type: "text", placeholder: "H" },
    { name: "el1_qty", label: "Unsur 1 - Jumlah", step: "1", placeholder: "2" },
    { name: "el2_symbol", label: "Unsur 2 - Simbol", type: "text", placeholder: "O" },
    { name: "el2_qty", label: "Unsur 2 - Jumlah", step: "1", placeholder: "1" },
    { name: "el3_symbol", label: "Unsur 3 - Simbol (opsional)", type: "text" },
    { name: "el3_qty", label: "Unsur 3 - Jumlah", step: "1" },
  ],
  EQUIVALENT_WEIGHT: [
    { name: "el1_symbol", label: "Unsur 1 - Simbol", type: "text", placeholder: "H" },
    { name: "el1_qty", label: "Unsur 1 - Jumlah", step: "1", placeholder: "2" },
    { name: "el2_symbol", label: "Unsur 2 - Simbol", type: "text", placeholder: "S" },
    { name: "el2_qty", label: "Unsur 2 - Jumlah", step: "1", placeholder: "1" },
    { name: "el3_symbol", label: "Unsur 3 - Simbol", type: "text", placeholder: "O" },
    { name: "el3_qty", label: "Unsur 3 - Jumlah", step: "1", placeholder: "4" },
    { name: "n_value", label: "Jumlah Ekuivalen (n)", step: "1", placeholder: "2" },
  ],
  STANDARDISASI: [
    { name: "simplo_awal", label: "Simplo: Awal (mL)", step: "0.01" },
    { name: "simplo_akhir", label: "Simplo: Akhir (mL)", step: "0.01" },
    { name: "duplo_awal", label: "Duplo: Awal (mL)", step: "0.01" },
    { name: "duplo_akhir", label: "Duplo: Akhir (mL)", step: "0.01" },
    { name: "volume_y", label: "Volume Y (mL)", step: "0.01" },
    { name: "konsentrasi_y", label: "Konsentrasi Y (N/M)", step: "0.001" },
  ],
  PENETAPAN_KADAR: [
    { name: "simplo_awal", label: "Simplo: Awal (mL)", step: "0.01" },
    { name: "simplo_akhir", label: "Simplo: Akhir (mL)", step: "0.01" },
    { name: "duplo_awal", label: "Duplo: Awal (mL)", step: "0.01" },
    { name: "duplo_akhir", label: "Duplo: Akhir (mL)", step: "0.01" },
    { name: "unsur_senyawa", label: "Unsur/Senyawa (simbol)", type: "text", placeholder: "Na" },
    { name: "konsentrasi_penitar", label: "Konsentrasi Penitar (N/M)", step: "0.001" },
    { name: "volume_sampel", label: "Volume Sampel (mL)", step: "0.1" },
    { name: "faktor_pengenceran", label: "Faktor Pengenceran", step: "1", placeholder: "1" },
  ],
  TITRATION_CURVE: [
    { name: "ka", label: "Ka (Konstanta Disosiasi)", step: "any", placeholder: "1.82e-5" },
    { name: "volume_y", label: "Volume Y (mL)", step: "0.1", placeholder: "100" },
    { name: "konsentrasi_y", label: "Konsentrasi Y (M)", step: "0.001", placeholder: "0.1" },
    { name: "volume_increment", label: "Volume Increment (mL)", step: "1", placeholder: "10" },
  ],
};

function buildInput(type: string, formData: Record<string, any>) {
  // Transform flat form data into engine input shape
  if (type === "MOLAR_MASS") {
    const elements = [];
    for (let i = 1; i <= 3; i++) {
      const sym = formData[`el${i}_symbol`];
      const qty = parseFloat(formData[`el${i}_qty`]);
      if (sym && qty) elements.push({ symbol: sym, quantity: qty });
    }
    return { groups: [elements] };
  }
  if (type === "EQUIVALENT_WEIGHT") {
    const elements = [];
    for (let i = 1; i <= 3; i++) {
      const sym = formData[`el${i}_symbol`];
      const qty = parseFloat(formData[`el${i}_qty`]);
      if (sym && qty) elements.push({ symbol: sym, quantity: qty });
    }
    return { groups: [elements], nValues: [parseFloat(formData.n_value) || 1] };
  }
  // For all other types, pass formData directly (all numeric values)
  const processed: Record<string, any> = {};
  for (const [key, val] of Object.entries(formData)) {
    processed[key] = typeof val === "string" && !isNaN(Number(val)) ? parseFloat(val) : val;
  }
  return processed;
}

function getMainResult(type: string, result: any): { value: string; label: string } {
  if (!result) return { value: "N/A", label: "" };
  const r = result.result || result;
  switch (type) {
    case "KADAR_AIR": return { value: `${r.moisture_pct?.toFixed(4)}%`, label: "Kadar Air" };
    case "KADAR_ABU": return { value: `${r.ash_pct?.toFixed(4)}%`, label: "Kadar Abu" };
    case "KADAR_PROTEIN":
    case "KADAR_PROTEIN_STANDARLESS":
      return { value: `${r.protein_pct?.toFixed(4)}%`, label: "Kadar Protein" };
    case "KARBOHIDRAT":
    case "KARBOHIDRAT_V2":
      return { value: `${r.carbohydrate_pct?.toFixed(4)}%`, label: "Kadar Karbohidrat" };
    case "MOLAR_MASS": return { value: `${r.totalMass?.toFixed(4)} g/mol`, label: "Massa Molar" };
    case "EQUIVALENT_WEIGHT": return { value: `${r.equivalentWeights?.[0]?.toFixed(4)} g/ekuivalen`, label: "Bobot Ekuivalen" };
    case "STANDARDISASI": return { value: `${r.konsentrasi_x?.toFixed(6)} N`, label: "Konsentrasi X" };
    case "PENETAPAN_KADAR": return { value: `${r.kadar?.toFixed(4)} g/L`, label: "Kadar" };
    case "TITRATION_CURVE": return { value: `pH ${r.point_at_equivalence?.ph?.toFixed(2)}`, label: "pH Titik Ekuivalen" };
    default: return { value: JSON.stringify(r), label: "Result" };
  }
}

export default function ExperimentRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const type = (params.type as string) || "";

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const input = buildInput(type, formData);
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experimentType: type, input }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "Calculation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = FORM_FIELDS[type] || [];
  const title = EXPERIMENT_LABELS[type] || type.replace(/_/g, " ");
  const mainResult = result ? getMainResult(type, result) : null;
  const steps = result?.result?.steps || [];

  // Build chart data for titration curve
  const chartData = result?.result && type === "TITRATION_CURVE"
    ? [
        ...(result.result.points_before || []).map((p: any) => ({ volume: p.volume, pH: p.ph })),
        { volume: result.result.point_at_equivalence?.volume, pH: result.result.point_at_equivalence?.ph },
        ...(result.result.points_after || []).map((p: any) => ({ volume: p.volume, pH: p.ph })),
      ]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/experiments">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-blue-600" />
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan data eksperimen untuk menghitung hasil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Data Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.length > 0 ? (
                fields.map((f) => (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={f.name}>{f.label}</Label>
                    <Input
                      id={f.name}
                      name={f.name}
                      type={f.type || "number"}
                      step={f.step}
                      placeholder={f.placeholder}
                      onChange={handleChange}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Form untuk tipe eksperimen ini sedang dikembangkan.
                </p>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <Button onClick={calculate} className="w-full mt-2" disabled={isLoading || fields.length === 0}>
                {isLoading ? "Menghitung..." : "Hitung"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Results */}
        <div className="space-y-6">
          {/* Main Result */}
          <Card>
            <CardHeader>
              <CardTitle>Hasil Perhitungan</CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center text-gray-400 py-12">
                  <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Masukkan data dan klik &quot;Hitung&quot; untuk melihat hasil</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">
                    {mainResult?.label}
                  </p>
                  <p className="text-4xl font-bold text-blue-900">{mainResult?.value}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Titration Chart */}
          {chartData && (
            <Card>
              <CardHeader>
                <CardTitle>Kurva Titrasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="volume" label={{ value: "Volume (mL)", position: "insideBottom", offset: -5 }} />
                      <YAxis domain={[0, 14]} label={{ value: "pH", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="pH" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calculation Steps */}
          {steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Langkah Perhitungan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step: any, i: number) => (
                    <div key={i} className="bg-gray-50 border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{step.id}</Badge>
                        <span className="font-medium text-sm text-gray-900">{step.name}</span>
                      </div>
                      <div className="font-mono text-xs text-gray-500 mb-1">{step.formula}</div>
                      <div className="font-semibold text-gray-800">
                        = {typeof step.result === "number" ? step.result.toFixed(6) : step.result}
                        {step.unit ? ` ${step.unit}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
