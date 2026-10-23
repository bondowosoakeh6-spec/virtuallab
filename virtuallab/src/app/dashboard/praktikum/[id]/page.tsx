"use client";

import { useEffect, useState, useId } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FlaskConical, ArrowLeft, CheckCircle2, BookOpen, 
  Beaker, ListOrdered, PlayCircle, Calculator, 
  FileCheck, Download, Send, Info, ChevronRight, ChevronLeft,
  Check, Clock, Award, MessageSquare, AlertCircle, Sparkles,
  Loader2, RefreshCw, BarChart3, HelpCircle
} from "lucide-react";
import { 
  moistureInputSchema, 
  ashInputSchema, 
  proteinInputSchema, 
  proteinStandardlessInputSchema, 
  carbohydrateInputSchema 
} from "@/lib/validations";

interface StepDefinition {
  step: number;
  id: string;
  label: string;
  shortLabel: string;
  icon: any;
}

const STEPS: StepDefinition[] = [
  { step: 1, id: 'teori', label: '1. Baca Teori', shortLabel: 'Teori', icon: BookOpen },
  { step: 2, id: 'simulasi', label: '2. Mulai Simulasi', shortLabel: 'Simulasi', icon: PlayCircle },
  { step: 3, id: 'input', label: '3. Input Data', shortLabel: 'Input', icon: Beaker },
  { step: 4, id: 'hitung', label: '4. Validasi & Hitung', shortLabel: 'Hitung', icon: Calculator },
  { step: 5, id: 'intermediate', label: '5. Intermediate Result', shortLabel: 'Langkah', icon: ListOrdered },
  { step: 6, id: 'final', label: '6. Final Result', shortLabel: 'Hasil', icon: BarChart3 },
  { step: 7, id: 'kesimpulan', label: '7. Isi Kesimpulan', shortLabel: 'Kesimpulan', icon: FileCheck },
  { step: 8, id: 'report', label: '8. Laporan & Submit', shortLabel: 'Submit', icon: Send },
  { step: 9, id: 'status', label: '9. Status & Nilai', shortLabel: 'Nilai', icon: Award },
];

export default function PraktikumWorkflowPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  // Experiment data
  const [experiment, setExperiment] = useState<any>(null);
  const [experimentType, setExperimentType] = useState<string>("moisture");
  const [isLoadingExperiment, setIsLoadingExperiment] = useState<boolean>(true);

  // Session state
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionStartTime, setSessionStartTime] = useState<string>("");
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  // Form input data
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculation state
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [calculationError, setCalculationError] = useState<string>("");

  // Report & submission state
  const [conclusion, setConclusion] = useState<string>("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submission, setSubmission] = useState<any>(null);

  // Detect experiment type from module slug or title
  const detectType = (slug: string, title: string = "") => {
    const combined = `${slug || ""} ${title || ""}`.toLowerCase().replace(/_/g, "-");
    if (combined.includes("protein-standardless") || combined.includes("tanpa-standar")) {
      return "protein_standardless";
    }
    if (combined.includes("protein")) {
      return "protein";
    }
    if (combined.includes("abu") || combined.includes("ash")) {
      return "ash";
    }
    if (combined.includes("karbo") || combined.includes("carbohydrate")) {
      return "carbohydrate";
    }
    return "moisture";
  };

  // Fetch experiment details and check existing submission on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingExperiment(true);
      try {
        // 1. Fetch experiment
        const res = await fetch(`/api/experiments/${id}`);
        let expData = null;
        if (res.ok) {
          const json = await res.json();
          expData = json.data || json;
        }

        if (expData) {
          setExperiment(expData);
          const detected = detectType(expData.module?.slug || "", expData.title || "");
          setExperimentType(detected);
        } else {
          // Fallback demo experiment if ID is not in DB
          const fallbackType = detectType(id, "");
          setExperimentType(fallbackType);
          setExperiment({
            id,
            title: fallbackType === 'ash' ? 'Penetapan Kadar Abu Bahan Pangan' : 
                   fallbackType === 'protein' ? 'Penetapan Kadar Protein Metode Kjeldahl' :
                   fallbackType === 'protein_standardless' ? 'Penetapan Kadar Protein Tanpa Standarisasi' :
                   fallbackType === 'carbohydrate' ? 'Penetapan Kadar Karbohidrat Metode Luff-Schoorl' :
                   'Penetapan Kadar Air Metode Gravimetri Oven',
            description: 'Simulasi praktikum analisis proksimat berbasis standar laboratorium terakreditasi.',
            instructions: 'Ikuti setiap tahapan praktikum dengan teliti, perhatikan massa penimbangan dan prosedur perhitungan.',
            module: {
              name: fallbackType.toUpperCase().replace('_', ' '),
              theory: 'Analisis proksimat merupakan metode analisis kimia kuantitatif untuk mengidentifikasi kandungan nutrisi utama bahan pangan yang mencakup air, abu, protein, lemak, dan karbohidrat.',
              procedure: '1. Persiapan alat dan bahan\n2. Penimbangan sampel dengan neraca analitik ketelitian 0.0001 g\n3. Perlakuan termal/titrimetri\n4. Pendinginan dalam desikator\n5. Penimbangan akhir hingga bobot konstan\n6. Perhitungan kadar analit',
            }
          });
        }

        // 2. Check if student already submitted this experiment
        const subRes = await fetch(`/api/submissions?experimentId=${id}`);
        if (subRes.ok) {
          const subJson = await subRes.json();
          const subs = subJson.data || subJson;
          if (Array.isArray(subs) && subs.length > 0) {
            const existingSub = subs[0];
            setSubmission(existingSub);
            if (existingSub.status === 'SUBMITTED' || existingSub.status === 'GRADED') {
              setCurrentStep(9);
              setMaxReachedStep(9);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching experiment data:", err);
      } finally {
        setIsLoadingExperiment(false);
      }
    };

    fetchData();
  }, [id]);

  // Navigate to step
  const goToStep = (stepNumber: number) => {
    if (stepNumber <= maxReachedStep || stepNumber <= currentStep + 1) {
      setCurrentStep(stepNumber);
      if (stepNumber > maxReachedStep) {
        setMaxReachedStep(stepNumber);
      }
    }
  };

  const nextStep = () => {
    const next = currentStep + 1;
    if (next <= 9) {
      setCurrentStep(next);
      if (next > maxReachedStep) {
        setMaxReachedStep(next);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 2: Mulai Simulasi
  const handleStartSimulation = async () => {
    setIsStartingSession(true);
    try {
      const res = await fetch(`/api/experiments/${id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionId(data.data.id);
        setSessionStartTime(new Date().toLocaleTimeString('id-ID'));
      } else {
        // Fallback local session if user is demo or session already exists
        const generated = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        setSessionId(generated);
        setSessionStartTime(new Date().toLocaleTimeString('id-ID'));
      }
      nextStep();
    } catch (err) {
      const fallback = `sess_${Date.now()}`;
      setSessionId(fallback);
      setSessionStartTime(new Date().toLocaleTimeString('id-ID'));
      nextStep();
    } finally {
      setIsStartingSession(false);
    }
  };

  // Handle Form Change with real-time validation
  const handleInputChange = (key: string, value: any) => {
    const numericKeys = [
      'bobot_wadah_kosong', 'bobot_sampel', 'bobot_setelah', 'bobot_cawan_sampel',
      'std_simplo_awal', 'std_simplo_akhir', 'std_duplo_awal', 'std_duplo_akhir',
      'volume_y', 'konsentrasi_y', 'blanko_simplo_awal', 'blanko_simplo_akhir',
      'blanko_duplo_awal', 'blanko_duplo_akhir', 'sample_simplo_awal', 'sample_simplo_akhir',
      'sample_duplo_awal', 'sample_duplo_akhir', 'konsentrasi_penitar', 'ketetapan_protein',
      'faktor_pengenceran', 'massa_sampel', 'konsentrasi_hcl', 'konsentrasi_penitar_dibuat'
    ];

    const parsedVal = numericKeys.includes(key) ? (value === "" ? "" : Number(value)) : value;

    const newFormData = {
      ...formData,
      [key]: parsedVal
    };
    setFormData(newFormData);

    // Validate field
    if (numericKeys.includes(key) && (parsedVal === "" || isNaN(parsedVal) || parsedVal < 0)) {
      setFormErrors(prev => ({ ...prev, [key]: "Harus berupa angka positif (>= 0)" }));
    } else {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  // Pre-fill realistic sample data for quick demonstration
  const handleFillSampleData = () => {
    let sample: Record<string, any> = {};
    if (experimentType === 'moisture') {
      sample = {
        bobot_wadah_kosong: 15.3421,
        bobot_sampel: 2.0543,
        bobot_setelah: 17.1124,
      };
    } else if (experimentType === 'ash') {
      sample = {
        bobot_wadah_kosong: 22.4510,
        bobot_cawan_sampel: 24.5020,
        bobot_setelah: 22.5840,
      };
    } else if (experimentType === 'protein') {
      sample = {
        std_simplo_awal: 0.0,
        std_simplo_akhir: 10.15,
        std_duplo_awal: 10.15,
        std_duplo_akhir: 20.35,
        volume_y: 10.0,
        konsentrasi_y: 0.1,
        blanko_simplo_awal: 0.0,
        blanko_simplo_akhir: 0.35,
        blanko_duplo_awal: 0.35,
        blanko_duplo_akhir: 0.75,
        sample_simplo_awal: 0.75,
        sample_simplo_akhir: 8.85,
        sample_duplo_awal: 8.85,
        sample_duplo_akhir: 16.90,
        konsentrasi_penitar: 0.1,
        ketetapan_protein: 14.007,
        faktor_pengenceran: 1,
        massa_sampel: 500,
        jenis_sampel: 'Daging',
      };
    } else if (experimentType === 'protein_standardless') {
      sample = {
        blanko_simplo_awal: 0.0,
        blanko_simplo_akhir: 0.40,
        blanko_duplo_awal: 0.40,
        blanko_duplo_akhir: 0.85,
        sample_simplo_awal: 0.0,
        sample_simplo_akhir: 7.90,
        sample_duplo_awal: 7.90,
        sample_duplo_akhir: 15.85,
        konsentrasi_hcl: 0.1,
        ketetapan_protein: 14.007,
        faktor_pengenceran: 1,
        massa_sampel: 500,
        jenis_sampel: 'Beras',
      };
    } else if (experimentType === 'carbohydrate') {
      sample = {
        std_simplo_awal: 0.0,
        std_simplo_akhir: 10.0,
        std_duplo_awal: 10.0,
        std_duplo_akhir: 20.0,
        volume_y: 10.0,
        konsentrasi_y: 0.1,
        blanko_simplo_awal: 0.0,
        blanko_simplo_akhir: 25.0,
        blanko_duplo_awal: 0.0,
        blanko_duplo_akhir: 25.0,
        sample_simplo_awal: 0.0,
        sample_simplo_akhir: 15.0,
        sample_duplo_awal: 15.0,
        sample_duplo_akhir: 30.0,
        konsentrasi_penitar_dibuat: 0.1,
        faktor_pengenceran: 10,
        massa_sampel: 250,
        sugar_type: 'glukosa_fruktosa',
        jenis_sampel: 'Pati',
      };
    }
    setFormData(sample);
    setFormErrors({});
  };

  // Validate form using Zod schemas
  const validateForm = (): boolean => {
    let schema: any;
    if (experimentType === 'moisture') schema = moistureInputSchema;
    else if (experimentType === 'ash') schema = ashInputSchema;
    else if (experimentType === 'protein') schema = proteinInputSchema;
    else if (experimentType === 'protein_standardless') schema = proteinStandardlessInputSchema;
    else if (experimentType === 'carbohydrate') schema = carbohydrateInputSchema;
    else schema = moistureInputSchema;

    const parseResult = schema.safeParse(formData);
    if (!parseResult.success) {
      const errs: Record<string, string> = {};
      parseResult.error.issues.forEach((err: any) => {
        const fieldName = err.path[0] as string;
        errs[fieldName] = err.message || "Input tidak valid";
      });
      setFormErrors(errs);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleProceedToCalculate = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  // Step 4: Run Calculation
  const handleCalculate = async () => {
    setIsCalculating(true);
    setCalculationError("");

    try {
      const endpointType = experimentType.replace('_', '-');
      const payload = {
        ...formData,
        sessionId: sessionId || undefined
      };

      // Try specific route /api/calculations/{type}
      let res = await fetch(`/api/calculations/${endpointType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Fallback to unified route /api/calculations if specific route fails
      if (!res.ok) {
        const legacyType = experimentType === 'ash' ? 'KADAR_ABU' :
                           experimentType === 'protein' ? 'KADAR_PROTEIN' :
                           experimentType === 'protein_standardless' ? 'KADAR_PROTEIN_STANDARLESS' :
                           experimentType === 'carbohydrate' ? 'KARBOHIDRAT' :
                           'KADAR_AIR';
        res = await fetch("/api/calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            experimentType: legacyType,
            input: formData
          })
        });
      }

      const json = await res.json();
      if (!res.ok || (json.success === false && !json.moisture_pct && !json.result)) {
        throw new Error(json.error?.message || json.error || "Gagal melakukan perhitungan analitik");
      }

      const resData = json.data?.result || json.data || json;
      setCalculationResult(resData);
      
      // Auto move to intermediate result
      setCurrentStep(5);
      if (maxReachedStep < 5) setMaxReachedStep(5);
    } catch (err: any) {
      setCalculationError(err.message || "Terjadi kesalahan pada modul kalkulasi.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Step 8: Download PDF Report
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: experiment?.title || "Praktikum Kimia Analisis",
          moduleName: experiment?.module?.name || experimentType.toUpperCase(),
          inputs: formData,
          results: calculationResult,
          steps: calculationResult?.steps || [],
          conclusion: conclusion,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        })
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh file PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_${experimentType}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Gagal mengunduh laporan PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Step 8: Submit Praktikum
  const handleSubmitPraktikum = async (isDraft = false) => {
    setIsSubmitting(true);
    try {
      const payload = {
        experimentId: experiment?.id || id,
        sessionId: sessionId || `session_${Date.now()}`,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
        conclusion: conclusion,
        reportUrl: `/reports/${sessionId || id}.pdf`
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || (json.success === false)) {
        throw new Error(json.error?.message || json.error || "Gagal mengumpulkan praktikum");
      }

      const subData = json.data || json;
      setSubmission(subData);

      if (!isDraft) {
        setCurrentStep(9);
        setMaxReachedStep(9);
      } else {
        alert("Draft praktikum berhasil disimpan.");
      }
    } catch (err: any) {
      alert(err.message || "Gagal memproses pengumpulan");
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Extract final percentage value for display & chart
  const getFinalValue = (): { value: number; label: string; unit: string } => {
    if (!calculationResult) return { value: 0, label: "Hasil Akhir", unit: "%" };
    if (calculationResult.moisture_pct !== undefined) {
      return { value: Number(calculationResult.moisture_pct), label: "Kadar Air", unit: "%" };
    }
    if (calculationResult.ash_pct !== undefined) {
      return { value: Number(calculationResult.ash_pct), label: "Kadar Abu", unit: "%" };
    }
    if (calculationResult.protein_pct !== undefined) {
      return { value: Number(calculationResult.protein_pct), label: "Kadar Protein", unit: "%" };
    }
    if (calculationResult.carbohydrate_pct !== undefined) {
      return { value: Number(calculationResult.carbohydrate_pct), label: "Kadar Karbohidrat", unit: "%" };
    }
    if (calculationResult.result !== undefined && calculationResult.result !== null) {
      return { value: Number(calculationResult.result), label: "Hasil Analisis", unit: calculationResult.unit || "%" };
    }
    return { value: 0, label: "Hasil Analisis", unit: "%" };
  };

  const finalMetric = getFinalValue();

  if (isLoadingExperiment) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Memuat modul praktikum...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link 
            href="/dashboard/praktikum" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali ke Daftar Praktikum
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              {experiment?.title || "Praktikum Kimia Analisis"}
            </h1>
            <Badge variant="default" className="text-xs">
              {experimentType.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {experiment?.module?.name ? `Modul: ${experiment.module.name}` : "Laboratorium Virtual Analisis Pangan & Kimia Terpadu"}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          {sessionId && (
            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-400 block">ID Sesi Simulasi</span>
              <span className="text-xs font-mono font-medium text-gray-700">{sessionId.slice(0, 16)}...</span>
            </div>
          )}
          <Badge 
            variant={
              submission?.status === 'GRADED' ? 'success' :
              submission?.status === 'SUBMITTED' ? 'warning' :
              sessionId ? 'default' : 'secondary'
            }
            className="px-3 py-1 text-xs"
          >
            {submission?.status === 'GRADED' ? 'Dinilai' :
             submission?.status === 'SUBMITTED' ? 'Menunggu Penilaian' :
             sessionId ? 'Simulasi Aktif' : 'Tahap Persiapan'}
          </Badge>
        </div>
      </div>

      {/* 9-Step Interactive Wizard Stepper */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center justify-between min-w-[760px] bg-white p-3 rounded-xl border shadow-xs">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            const isAccessible = s.step <= maxReachedStep;

            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => goToStep(s.step)}
                  disabled={!isAccessible}
                  className={`flex flex-col items-center gap-1 group px-2 py-1 rounded-lg transition-all ${
                    isCurrent ? 'opacity-100 scale-105' : 
                    isAccessible ? 'opacity-90 hover:opacity-100 cursor-pointer' : 
                    'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] whitespace-nowrap font-medium ${
                    isCurrent ? 'text-blue-600 font-bold' : 
                    isCompleted ? 'text-emerald-700' : 'text-gray-500'
                  }`}>
                    {s.shortLabel}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-1.5 transition-colors ${
                    idx + 1 < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="min-h-[520px] shadow-sm">
        
        {/* ============================================================ */}
        {/* STEP 1: BACA TEORI */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 1 dari 9</span>
              </div>
              <CardTitle className="text-xl">Dasar Teori & Petunjuk Praktikum</CardTitle>
              <CardDescription>
                Pelajari landasan ilmiah, tujuan, dan prosedur operasional sebelum memulai simulasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" /> Deskripsi Praktikum
                </h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {experiment?.description || "Praktikum ini melatih mahasiswa dalam prosedur kuantitatif analisis laboratorium pangan sesuai ketetapan analitik resmi."}
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Prinsip & Teori Kimia</h3>
                <div className="prose text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
                  {experiment?.module?.theory ? (
                    experiment.module.theory.split('\n\n').map((para: string, idx: number) => (
                      <p key={idx} className="mb-2 text-justify">{para}</p>
                    ))
                  ) : (
                    <p className="text-justify">
                      Analisis proksimat merupakan metode gravimetri dan titrimetri analitik klasik yang menjadi standar verifikasi mutu bahan pangan dan pakan. Akurasi penimbangan neraca analitik dan ketelitian pembacaan miniskus buret sangat menentukan tingkat perolehan kembali (recovery rate).
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Prosedur Kerja Terstandar</h3>
                <div className="space-y-2">
                  {(experiment?.module?.procedure || experiment?.instructions || "1. Siapkan peralatan dan bahan dalam kondisi bersih dan kering.\n2. Lakukan penimbangan sampel menggunakan neraca analitik.\n3. Catat bobot awal dan akhir dengan teliti.\n4. Lakukan perhitungan hasil pengamatan.")
                    .split('\n')
                    .filter((line: string) => line.trim().length > 0)
                    .map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-3 text-sm text-gray-700 bg-white p-3 rounded border">
                        <span className="font-bold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                        <span>{step.replace(/^\d+[\.\)]\s*/, '')}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Link href="/dashboard/praktikum">
                <Button variant="outline">Kembali ke Menu</Button>
              </Link>
              <Button onClick={() => { goToStep(2); }} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Lanjutkan ke Simulasi <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 2: MULAI SIMULASI */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <PlayCircle className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 2 dari 9</span>
              </div>
              <CardTitle className="text-xl">Inisiasi Sesi Simulasi Laboratorium</CardTitle>
              <CardDescription>
                Sistem akan membuat instansi sesi virtual praktikum untuk mencatat log interaksi dan data pengamatan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-5 bg-gray-50/50 space-y-4">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-blue-600" /> Informasi Laboratorium
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between py-1 border-b">
                      <span>Modul Praktikum:</span>
                      <span className="font-medium text-gray-900">{experiment?.title}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Metode Analisis:</span>
                      <span className="font-medium text-gray-900">{experimentType.toUpperCase().replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Status Simulasi:</span>
                      <span className="font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Siap Digunakan
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Waktu Mulai:</span>
                      <span className="font-mono text-gray-800">{sessionStartTime || 'Belum dimulai'}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-5 bg-blue-50/30 space-y-3">
                  <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" /> Kesiapan Alat & Reagen
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" /> Neraca Analitik Terkalibrasi (d = 0.0001 g)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" /> Desikator & Silika Gel Aktif
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" /> Cawan Porselin / Labu Erlenmeyer Bersih
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" /> Reagen Kimia Mutu Pro Analisis (p.a.)
                    </li>
                  </ul>
                </div>
              </div>

              {sessionId ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm">Sesi Simulasi Berhasil Dibuat</h4>
                    <p className="text-xs text-emerald-700 mt-1 font-mono">
                      ID Sesi: {sessionId} • Waktu: {sessionStartTime}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm">Inisiasi Diperlukan</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Klik tombol &ldquo;Mulai Sesi Simulasi&rdquo; di bawah untuk menghubungkan workspace praktikum Anda ke sistem audit analitik.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              {sessionId ? (
                <Button onClick={nextStep} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Lanjut ke Input Data <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleStartSimulation} 
                  disabled={isStartingSession}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isStartingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  Mulai Sesi Simulasi
                </Button>
              )}
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 3: INPUT DATA */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Beaker className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-wider font-bold">Langkah 3 dari 9</span>
                  </div>
                  <CardTitle className="text-xl">Input Data Hasil Pengamatan</CardTitle>
                  <CardDescription>
                    Masukkan angka penimbangan dan titrasi sesuai parameter modul {experimentType.toUpperCase().replace('_', ' ')}.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFillSampleData} 
                  className="gap-1.5 text-xs text-blue-600 hover:bg-blue-50 border-blue-200"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Gunakan Contoh Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* FORM KADAR AIR */}
              {experimentType === 'moisture' && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bobot_wadah_kosong">Bobot Wadah Kosong (W₀)</Label>
                    <div className="relative">
                      <Input
                        id="bobot_wadah_kosong"
                        type="number"
                        step="0.0001"
                        placeholder="Contoh: 15.3421"
                        value={formData.bobot_wadah_kosong ?? ""}
                        onChange={(e) => handleInputChange('bobot_wadah_kosong', e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span>
                    </div>
                    {formErrors.bobot_wadah_kosong && (
                      <p className="text-xs text-red-500">{formErrors.bobot_wadah_kosong}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bobot_sampel">Bobot Sampel Awal (W₁)</Label>
                    <div className="relative">
                      <Input
                        id="bobot_sampel"
                        type="number"
                        step="0.0001"
                        placeholder="Contoh: 2.0543"
                        value={formData.bobot_sampel ?? ""}
                        onChange={(e) => handleInputChange('bobot_sampel', e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span>
                    </div>
                    {formErrors.bobot_sampel && (
                      <p className="text-xs text-red-500">{formErrors.bobot_sampel}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bobot_setelah">Bobot Wadah + Sampel Akhir (W₂)</Label>
                    <div className="relative">
                      <Input
                        id="bobot_setelah"
                        type="number"
                        step="0.0001"
                        placeholder="Contoh: 17.1124"
                        value={formData.bobot_setelah ?? ""}
                        onChange={(e) => handleInputChange('bobot_setelah', e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span>
                    </div>
                    {formErrors.bobot_setelah && (
                      <p className="text-xs text-red-500">{formErrors.bobot_setelah}</p>
                    )}
                  </div>
                </div>
              )}

              {/* FORM KADAR ABU */}
              {experimentType === 'ash' && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bobot_wadah_kosong">Bobot Cawan Kosong (W₀)</Label>
                    <div className="relative">
                      <Input
                        id="bobot_wadah_kosong"
                        type="number"
                        step="0.0001"
                        placeholder="Contoh: 22.4510"
                        value={formData.bobot_wadah_kosong ?? ""}
                        onChange={(e) => handleInputChange('bobot_wadah_kosong', e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span>
                    </div>
                    {formErrors.bobot_wadah_kosong && (
                      <p className="text-xs text-red-500">{formErrors.bobot_wadah_kosong}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bobot_cawan_sampel">Bobot Cawan + Sampel (W₁)</Label>
                    <div className="relative">
                      <Input
                        id="bobot_cawan_sampel"
                        type="number"
                        step="0.0001"
                        placeholder="Contoh: 24.5020"
                        value={formData.bobot_cawan_sampel ?? ""}
                        onChange={(e) => handleInputChange('bobot_cawan_sampel', e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span>
                    </div>
                    {formErrors.bobot_cawan_sampel && (
                      <p className="text-xs text-red-500">{formErrors.bobot_cawan_sampel}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bobot_setelah">Bobot Cawan + Abu (W₂)</Label>
                    <div className="relative">
                      <Input
                        id="bobot_setelah"
                        type="number"
                        step="0.0001"
                        placeholder="Contoh: 22.5840"
                        value={formData.bobot_setelah ?? ""}
                        onChange={(e) => handleInputChange('bobot_setelah', e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span>
                    </div>
                    {formErrors.bobot_setelah && (
                      <p className="text-xs text-red-500">{formErrors.bobot_setelah}</p>
                    )}
                  </div>
                </div>
              )}

              {/* FORM KADAR PROTEIN */}
              {(experimentType === 'protein' || experimentType === 'protein_standardless') && (
                <div className="space-y-6">
                  {experimentType === 'protein' && (
                    <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-700">1. Titrasi Standarisasi HCl</h4>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs">Simplo Awal (mL)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.std_simplo_awal ?? ""}
                            onChange={(e) => handleInputChange('std_simplo_awal', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Simplo Akhir (mL)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.std_simplo_akhir ?? ""}
                            onChange={(e) => handleInputChange('std_simplo_akhir', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duplo Awal (mL)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.std_duplo_awal ?? ""}
                            onChange={(e) => handleInputChange('std_duplo_awal', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duplo Akhir (mL)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.std_duplo_akhir ?? ""}
                            onChange={(e) => handleInputChange('std_duplo_akhir', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Volume Standar Y (mL)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData.volume_y ?? ""}
                            onChange={(e) => handleInputChange('volume_y', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Konsentrasi Standar Y (N)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={formData.konsentrasi_y ?? ""}
                            onChange={(e) => handleInputChange('konsentrasi_y', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-700">2. Titrasi Blanko & Sampel</h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Blanko Simplo Awal</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.blanko_simplo_awal ?? ""}
                          onChange={(e) => handleInputChange('blanko_simplo_awal', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Blanko Simplo Akhir</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.blanko_simplo_akhir ?? ""}
                          onChange={(e) => handleInputChange('blanko_simplo_akhir', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Blanko Duplo Awal</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.blanko_duplo_awal ?? ""}
                          onChange={(e) => handleInputChange('blanko_duplo_awal', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Blanko Duplo Akhir</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.blanko_duplo_akhir ?? ""}
                          onChange={(e) => handleInputChange('blanko_duplo_akhir', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Sampel Simplo Awal</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.sample_simplo_awal ?? ""}
                          onChange={(e) => handleInputChange('sample_simplo_awal', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Sampel Simplo Akhir</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.sample_simplo_akhir ?? ""}
                          onChange={(e) => handleInputChange('sample_simplo_akhir', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Sampel Duplo Awal</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.sample_duplo_awal ?? ""}
                          onChange={(e) => handleInputChange('sample_duplo_awal', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Sampel Duplo Akhir</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.sample_duplo_akhir ?? ""}
                          onChange={(e) => handleInputChange('sample_duplo_akhir', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-700">3. Parameter Analisis</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">{experimentType === 'protein_standardless' ? 'Konsentrasi HCl (N)' : 'Konsentrasi Penitar (N)'}</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={formData[experimentType === 'protein_standardless' ? 'konsentrasi_hcl' : 'konsentrasi_penitar'] ?? ""}
                          onChange={(e) => handleInputChange(experimentType === 'protein_standardless' ? 'konsentrasi_hcl' : 'konsentrasi_penitar', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Massa Sampel (mg)</Label>
                        <Input
                          type="number"
                          step="1"
                          value={formData.massa_sampel ?? ""}
                          onChange={(e) => handleInputChange('massa_sampel', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Jenis Bahan Pangan</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={formData.jenis_sampel ?? "Daging"}
                          onChange={(e) => handleInputChange('jenis_sampel', e.target.value)}
                        >
                          <option value="Daging">Daging (Faktor: 6.25)</option>
                          <option value="Beras">Beras (Faktor: 5.95)</option>
                          <option value="Kacang Kedelai">Kedelai (Faktor: 5.71)</option>
                          <option value="Susu">Susu (Faktor: 6.38)</option>
                          <option value="Telur">Telur (Faktor: 6.25)</option>
                          <option value="Gandum">Gandum (Faktor: 5.83)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM KARBOHIDRAT */}
              {experimentType === 'carbohydrate' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Massa Sampel (mg)</Label>
                      <Input
                        type="number"
                        step="1"
                        value={formData.massa_sampel ?? ""}
                        onChange={(e) => handleInputChange('massa_sampel', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Faktor Pengenceran</Label>
                      <Input
                        type="number"
                        step="1"
                        value={formData.faktor_pengenceran ?? ""}
                        onChange={(e) => handleInputChange('faktor_pengenceran', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Jenis Gula</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={formData.sugar_type ?? "glukosa_fruktosa"}
                        onChange={(e) => handleInputChange('sugar_type', e.target.value)}
                      >
                        <option value="glukosa_fruktosa">Glukosa / Fruktosa</option>
                        <option value="laktosa">Laktosa</option>
                        <option value="maltosa">Maltosa</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Volume Titrasi Blanko (mL)</Label>
                      <Input
                        type="number"
                        step="0.05"
                        placeholder="Contoh: 25.0"
                        value={formData.blanko_simplo_akhir ?? ""}
                        onChange={(e) => handleInputChange('blanko_simplo_akhir', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Volume Titrasi Sampel (mL)</Label>
                      <Input
                        type="number"
                        step="0.05"
                        placeholder="Contoh: 15.0"
                        value={formData.sample_simplo_akhir ?? ""}
                        onChange={(e) => handleInputChange('sample_simplo_akhir', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Validation errors summary */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <span className="font-bold">Perhatian:</span> Mohon lengkapi seluruh field formulir dengan format angka yang valid.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              <Button onClick={handleProceedToCalculate} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Validasi & Lanjut ke Hitung <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 4: VALIDASI & HITUNG */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Calculator className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 4 dari 9</span>
              </div>
              <CardTitle className="text-xl">Verifikasi & Eksekusi Perhitungan</CardTitle>
              <CardDescription>
                Data telah divalidasi. Jalankan engine perhitungan untuk menghasilkan kalkulasi kuantitatif.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ringkasan Input Terverifikasi
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(formData).map(([k, v]) => (
                    <div key={k} className="bg-white p-2.5 rounded border">
                      <span className="text-gray-500 block truncate">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-gray-900 text-sm">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {calculationError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal Menghitung:</span> {calculationError}
                  </div>
                </div>
              )}

              <div className="text-center py-6 border-2 border-dashed rounded-xl bg-blue-50/20">
                {isCalculating ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="font-medium text-gray-800 text-sm">Menghitung analit dengan formula baku...</p>
                    <span className="text-xs text-gray-500">Mengeksekusi lookup tabel dan verifikasi penimbangan</span>
                  </div>
                ) : calculationResult ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-900">Perhitungan Berhasil!</h3>
                    <p className="text-sm text-gray-600">
                      Hasil analitik telah dihasilkan secara kuantitatif beserta seluruh tahapan antara.
                    </p>
                    <Button onClick={() => goToStep(5)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                      Lihat Intermediate Result <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Calculator className="w-12 h-12 text-blue-600 mx-auto" />
                    <h3 className="text-base font-semibold text-gray-900">Siap Menjalankan Kalkulasi</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Sistem akan menyubstitusikan nilai input ke dalam model matematis analitik dan mencatat traceability formula.
                    </p>
                    <Button 
                      onClick={handleCalculate} 
                      disabled={isCalculating}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      <PlayCircle className="w-4 h-4" /> Hitung Sekarang
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali ke Input
              </Button>
              {calculationResult && (
                <Button onClick={() => goToStep(5)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  Lanjut ke Intermediate Result <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 5: LIHAT INTERMEDIATE RESULT */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <ListOrdered className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 5 dari 9</span>
              </div>
              <CardTitle className="text-xl">Tahapan Perhitungan Antara (Intermediate Steps)</CardTitle>
              <CardDescription>
                Tinjau rincian setiap substitusi formula matematika analitik untuk memastikan transparansi hitungan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {calculationResult?.steps && Array.isArray(calculationResult.steps) && calculationResult.steps.length > 0 ? (
                <div className="space-y-3">
                  {calculationResult.steps.map((st: any, idx: number) => (
                    <div key={st.id || idx} className="p-4 bg-gray-50 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {st.id || `LANGKAH-${idx + 1}`}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{st.name || st.formula}</span>
                        </div>
                        <p className="text-xs font-mono text-gray-600 bg-white p-1.5 rounded border inline-block">
                          {st.formulaDisplay || st.formula || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Hasil Antara</span>
                        <span className="text-lg font-bold font-mono text-blue-700">
                          {st.result !== null && st.result !== undefined ? Number(st.result).toFixed(4) : '-'} {st.unit || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg text-center space-y-2">
                  <Info className="w-8 h-8 text-blue-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-700">Rincian parameter operasional:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                    {Object.entries(calculationResult || {}).map(([k, v]: [string, any]) => {
                      if (typeof v === 'number' || typeof v === 'string') {
                        return (
                          <div key={k} className="bg-white p-3 rounded border text-left">
                            <span className="text-gray-400 block text-[10px] truncate">{k}</span>
                            <span className="font-bold text-gray-900">{typeof v === 'number' ? v.toFixed(4) : v}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              <Button onClick={() => goToStep(6)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Lanjut ke Hasil Akhir <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 6: LIHAT FINAL RESULT */}
        {/* ============================================================ */}
        {currentStep === 6 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 6 dari 9</span>
              </div>
              <CardTitle className="text-xl">Hasil Akhir & Analisis Kuantitatif</CardTitle>
              <CardDescription>
                Nilai akhir analit beserta pembandingan terhadap ambang batas standar mutu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Metric Box */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold block mb-1">
                      Kuantitas Analit Terukur
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-mono">
                      {finalMetric.value.toFixed(4)} <span className="text-2xl font-normal text-blue-200">{finalMetric.unit}</span>
                    </h2>
                    <p className="text-sm text-blue-100 mt-2">
                      Parameter: <span className="font-semibold text-white">{finalMetric.label}</span> ({experimentType.toUpperCase().replace('_', ' ')})
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Badge variant="outline" className="border-blue-300 text-white bg-blue-800/60 px-3 py-1">
                      Status: Memenuhi Standar Analitik
                    </Badge>
                    <span className="text-xs text-blue-300">Presisi 4 Desimal Neraca Analitik</span>
                  </div>
                </div>
              </div>

              {/* Graphical Visualization Bar Comparison */}
              <div className="border rounded-xl p-5 bg-white space-y-4">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" /> Perbandingan Visual Terhadap Referensi Mutu SNI
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                      <span>Hasil Pengamatan Praktikan</span>
                      <span className="font-mono font-bold text-blue-600">{finalMetric.value.toFixed(2)}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, finalMetric.value * 2.5))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                      <span>Rentang Nilai Acuan Pangan (SNI)</span>
                      <span className="font-mono text-gray-500">10.00% - 15.00%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-emerald-400/60 rounded-full"
                        style={{ width: '40%', marginLeft: '25%' }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 pt-1">
                  *Visualisasi merefleksikan proporsi fraksi massa sampel yang dianalisis dalam toleransi analitik gravimetri/titrimetri.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              <Button onClick={() => goToStep(7)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Lanjut ke Isi Kesimpulan <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 7: ISI KESIMPULAN */}
        {/* ============================================================ */}
        {currentStep === 7 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <FileCheck className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 7 dari 9</span>
              </div>
              <CardTitle className="text-xl">Formulasi Kesimpulan Praktikan</CardTitle>
              <CardDescription>
                Tuliskan analisis pembahasan dan simpulan ilmiah berdasarkan hasil perhitungan dan tujuan praktikum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" /> Panduan Penulisan Kesimpulan:
                </span>
                <p>1. Sebutkan nilai akhir {finalMetric.label} yang diperoleh ({finalMetric.value.toFixed(4)} {finalMetric.unit}).</p>
                <p>2. Bandingkan apakah hasil tersebut sesuai dengan standar acuan pustaka/SNI.</p>
                <p>3. Uraikan faktor-faktor yang mempengaruhi tingkat akurasi selama prosedur percobaan.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="kesimpulan" className="font-semibold text-sm">Teks Kesimpulan & Pembahasan</Label>
                  <span className="text-xs text-gray-400">Minimal 20 karakter ({conclusion.length} karakter)</span>
                </div>
                <Textarea
                  id="kesimpulan"
                  rows={8}
                  placeholder="Contoh: Berdasarkan praktikum penentuan kadar air menggunakan metode oven gravimetri, diperoleh kadar air sampel sebesar 12.4580%. Nilai ini memenuhi standar mutu pangan SNI yang mensyaratkan kadar air di bawah 14%. Penimbangan cawan konstan dan proses pendinginan dalam desikator sangat mempengaruhi keterulangan hasil..."
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  className="leading-relaxed"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              <Button 
                onClick={() => goToStep(8)} 
                disabled={conclusion.trim().length < 10}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Lanjut ke Laporan & Submit <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 8: GENERATE REPORT & SUBMIT */}
        {/* ============================================================ */}
        {currentStep === 8 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Send className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 8 dari 9</span>
              </div>
              <CardTitle className="text-xl">Pratinjau Laporan & Pengumpulan</CardTitle>
              <CardDescription>
                Periksa pratinjau lembar laporan resmi praktikum, unduh PDF, dan kumpulkan tugas ke dosen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Preview Document */}
              <div className="border rounded-xl bg-white shadow-xs p-6 space-y-6 border-gray-200">
                <div className="border-b pb-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-blue-900">VirtualLab AKUANALIS</h3>
                    <p className="text-xs text-gray-500">Laporan Resmi Praktikum Kimia Analisis Terpadu</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date().toLocaleDateString('id-ID')}
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Judul Praktikum</span>
                    <span className="font-semibold text-gray-800">{experiment?.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ID Sesi Simulasi</span>
                    <span className="font-mono font-semibold text-gray-800">{sessionId || '-'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">1. Data Pengamatan</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(formData).map(([k, v]) => (
                      <div key={k} className="p-2 bg-gray-50 rounded border">
                        <span className="text-gray-500 block truncate">{k}</span>
                        <span className="font-semibold text-gray-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">2. Hasil Analitik</h4>
                  <div className="p-3 bg-blue-50/50 rounded border border-blue-100 flex justify-between items-center">
                    <span className="text-xs text-blue-900 font-medium">{finalMetric.label}</span>
                    <span className="text-lg font-bold font-mono text-blue-800">
                      {finalMetric.value.toFixed(4)} {finalMetric.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">3. Kesimpulan Praktikan</h4>
                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded border leading-relaxed italic">
                    &ldquo;{conclusion}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="gap-2 w-full sm:w-auto"
                >
                  {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Unduh Laporan (PDF)
                </Button>
                <Button 
                  onClick={() => setShowConfirmModal(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" /> Kumpulkan Praktikum
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Kembali ke Kesimpulan
              </Button>
            </CardFooter>
          </>
        )}

        {/* ============================================================ */}
        {/* STEP 9: WAITING FOR GRADING / VIEW GRADE / VIEW FEEDBACK */}
        {/* ============================================================ */}
        {currentStep === 9 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Langkah 9 dari 9</span>
              </div>
              <CardTitle className="text-xl">Status Pengumpulan & Penilaian</CardTitle>
              <CardDescription>
                Informasi status review instruktur/dosen, nilai rubrik analitik, dan umpan balik praktikum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Submission status alert */}
              {submission?.grade ? (
                /* Graded State */
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Badge variant="success" className="mb-1">Telah Dinilai</Badge>
                      <h3 className="text-xl font-bold text-emerald-950">Laporan Praktikum Selesai Dievaluasi</h3>
                      <p className="text-xs text-emerald-700">
                        Diserahkan pada: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('id-ID') : 'Hari ini'}
                      </p>
                    </div>
                    <div className="text-left md:text-right bg-white px-6 py-4 rounded-xl border border-emerald-100 shadow-xs">
                      <span className="text-xs text-gray-500 block uppercase font-medium">Nilai Akhir</span>
                      <span className="text-4xl font-extrabold text-emerald-600 font-mono">
                        {Number(submission.grade.total).toFixed(1)}
                        <span className="text-base text-gray-400 font-normal"> / 100</span>
                      </span>
                    </div>
                  </div>

                  {/* Rubric Breakdown */}
                  <div className="border rounded-xl p-5 space-y-4">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" /> Rincian Nilai Komponen Praktikum
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-[11px] text-gray-500 block">Pre-Test (15%)</span>
                        <span className="text-lg font-bold text-gray-900">{submission.grade.preTest ?? 85}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-[11px] text-gray-500 block">Praktikal (25%)</span>
                        <span className="text-lg font-bold text-gray-900">{submission.grade.practical ?? 90}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-[11px] text-gray-500 block">Kalkulasi (25%)</span>
                        <span className="text-lg font-bold text-gray-900">{submission.grade.calculation ?? 95}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-[11px] text-gray-500 block">Laporan (20%)</span>
                        <span className="text-lg font-bold text-gray-900">{submission.grade.report ?? 88}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-[11px] text-gray-500 block">Post-Test (15%)</span>
                        <span className="text-lg font-bold text-gray-900">{submission.grade.postTest ?? 85}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Box */}
                  {submission.grade.feedback && (
                    <div className="border rounded-xl p-5 bg-blue-50/30 border-blue-100 space-y-2">
                      <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" /> Catatan & Feedback Instruktur
                      </h4>
                      <p className="text-sm text-gray-700 leading-relaxed italic bg-white p-4 rounded-lg border border-blue-50">
                        &ldquo;{submission.grade.feedback}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Waiting for Grading State */
                <div className="text-center py-12 px-4 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Praktikum Berhasil Dikumpulkan!</h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Laporan Anda telah berhasil masuk ke sistem penilaian. Instruktur atau dosen pengampu sedang melakukan peninjauan terhadap data penimbangan, ketepatan formula, dan pembahasan Anda.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Status Pengumpulan:</span>
                      <span className="font-semibold text-amber-600">MENUNGGU PENILAIAN (SUBMITTED)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu Pengiriman:</span>
                      <span className="font-medium text-gray-800">
                        {submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString('id-ID') : 'Baru saja'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => goToStep(8)} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Lihat Laporan
              </Button>
              <Link href="/dashboard/praktikum">
                <Button className="bg-blue-600 hover:bg-blue-700">Kembali ke Daftar Praktikum</Button>
              </Link>
            </CardFooter>
          </>
        )}

      </Card>

      {/* Confirmation Modal Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Konfirmasi Pengumpulan Praktikum</h3>
              <p className="text-sm text-gray-600 mt-1">
                Apakah Anda yakin data pengamatan, hasil perhitungan, dan kesimpulan telah lengkap? Laporan ini akan dikirimkan kepada dosen untuk dinilai.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                onClick={() => handleSubmitPraktikum(false)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Ya, Kumpulkan Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
