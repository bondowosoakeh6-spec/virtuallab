"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EXPERIMENT_DEFINITIONS } from "@/lib/calculations/experiment-engine";
import { Clock, History, GraduationCap } from "lucide-react";

// Map experiment types to categories and metadata for gallery display
const GALLERY_DATA: Record<string, {
  category: string;
  difficulty: string;
  duration: string;
  image: string;
}> = {
  moisture: {
    category: "Kimia Dasar",
    difficulty: "Pemula",
    duration: "45 Menit",
    image: "/gallery/titrasi.png",
  },
  ash: {
    category: "Kimia Dasar",
    difficulty: "Pemula",
    duration: "30 Menit",
    image: "/gallery/kromatografi.png",
  },
  protein: {
    category: "Analisis Instrumental",
    difficulty: "Menengah",
    duration: "60 Menit",
    image: "/gallery/spektrofotometri.png",
  },
  protein_standardless: {
    category: "Analisis Instrumental",
    difficulty: "Menengah",
    duration: "60 Menit",
    image: "/gallery/spektrofotometri.png",
  },
  carbohydrate: {
    category: "Kimia Organik",
    difficulty: "Menengah",
    duration: "50 Menit",
    image: "/gallery/titrasi.png",
  },
  standardization: {
    category: "Kimia Dasar",
    difficulty: "Pemula",
    duration: "40 Menit",
    image: "/gallery/kromatografi.png",
  },
  assay: {
    category: "Analisis Instrumental",
    difficulty: "Lanjutan",
    duration: "75 Menit",
    image: "/gallery/spektrofotometri.png",
  },
};

const ALL_CATEGORIES = ["Semua Modul", "Kimia Dasar", "Kimia Organik", "Analisis Instrumental"];
const ALL_DIFFICULTIES = ["Pemula", "Menengah", "Lanjutan"];

export default function PraktikumListPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua Modul");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const experiments = Object.entries(EXPERIMENT_DEFINITIONS).map(([key, exp]) => ({
    ...exp,
    key,
    gallery: GALLERY_DATA[key] || {
      category: "Kimia Dasar",
      difficulty: "Pemula",
      duration: "30 Menit",
      image: "/gallery/titrasi.png",
    },
  }));

  const filtered = experiments.filter((exp) => {
    const catMatch = selectedCategory === "Semua Modul" || exp.gallery.category === selectedCategory;
    const diffMatch = !selectedDifficulty || exp.gallery.difficulty === selectedDifficulty;
    return catMatch && diffMatch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Virtual Lab Gallery
        </h1>
        <Link
          href="/dashboard/riwayat"
          className="inline-flex items-center gap-2 text-white font-medium px-5 py-2.5 rounded-full text-sm hover:opacity-90 transition shadow-md"
          style={{ backgroundColor: '#2D2B7F' }}
        >
          <History className="w-4 h-4" />
          Riwayat Praktikum
        </Link>
      </div>

      {/* Content: Sidebar + Cards */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:w-60 shrink-0 space-y-8">
          {/* Kategori */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">Kategori</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                    selectedCategory === cat
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  style={selectedCategory === cat ? { backgroundColor: '#2D2B7F' } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tingkat Kesulitan */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">Tingkat Kesulitan</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() =>
                    setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                    selectedDifficulty === diff
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  style={selectedDifficulty === diff ? { backgroundColor: '#2D2B7F' } : undefined}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Tidak ada praktikum ditemukan</p>
              <p className="text-sm text-slate-400 mt-1">Coba ubah filter kategori atau tingkat kesulitan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Card Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                    {/* Category Badge */}
                    <span
                      className="absolute top-3 left-3 z-10 text-xs font-semibold px-3 py-1 rounded-md text-white"
                      style={{ backgroundColor: '#2D2B7F' }}
                    >
                      {exp.gallery.category}
                    </span>

                    {/* Lab illustration placeholder */}
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src="/lab-illustration.svg"
                        alt={exp.title}
                        width={280}
                        height={180}
                        className="w-3/4 h-auto opacity-80"
                      />
                    </div>

                    {/* Subtle title overlay */}
                    <span className="absolute top-3 right-3 text-[10px] text-slate-400 font-mono tracking-wider">
                      Virtual Lab Gallery
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {exp.gallery.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exp.gallery.duration}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/dashboard/praktikum/${exp.type}`}
                        className="block w-full text-center text-white font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition shadow-sm"
                        style={{ backgroundColor: '#34C9A2' }}
                      >
                        Mulai Praktikum
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
