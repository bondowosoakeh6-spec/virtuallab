"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

const experiments = [
  { id: "KADAR_AIR", title: "Kadar Air (Moisture Content)", desc: "Analisis kandungan air dalam sampel." },
  { id: "KADAR_ABU", title: "Kadar Abu (Ash Content)", desc: "Analisis residu anorganik sisa pembakaran." },
  { id: "KADAR_PROTEIN", title: "Kadar Protein (Kjeldahl)", desc: "Metode Kjeldahl dengan standarisasi." },
  { id: "KADAR_PROTEIN_STANDARLESS", title: "Kadar Protein (Tanpa Standarisasi)", desc: "Metode Kjeldahl praktis." },
  { id: "KARBOHIDRAT", title: "Karbohidrat (Luff Schoorl)", desc: "Analisis gula pereduksi." },
  { id: "MOLAR_MASS", title: "Massa Molar", desc: "Perhitungan massa molar senyawa." },
  { id: "EQUIVALENT_WEIGHT", title: "Bobot Ekuivalen", desc: "Perhitungan bobot ekuivalen asam/basa." },
  { id: "STANDARDISASI", title: "Standardisasi", desc: "Penentuan konsentrasi larutan standar." },
  { id: "STANDARDISASI_KADAR", title: "Standardisasi & Kadar", desc: "Standarisasi dilanjutkan penetapan kadar." },
  { id: "PENETAPAN_KADAR", title: "Penetapan Kadar", desc: "Titrasi volumetri." },
  { id: "TITRATION_CURVE", title: "Kurva Titrasi", desc: "Pembuatan dan analisis kurva titrasi asam-basa." },
];

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Virtual Laboratory</h1>
        <p className="text-slate-600 mt-1">Select an experiment to start</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.map((exp) => (
          <Card key={exp.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <FlaskConical size={20} />
              </div>
              <CardTitle className="text-lg">{exp.title}</CardTitle>
              <CardDescription>{exp.desc}</CardDescription>
            </CardHeader>
            <div className="flex-grow"></div>
            <CardFooter>
              <Link href={`/dashboard/experiments/${exp.id}`} className="w-full">
                <Button className="w-full" variant="default">Start Experiment</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
