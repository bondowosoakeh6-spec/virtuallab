"use client";

import { useState, useEffect } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, BookOpen } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  code: string;
  course: string;
  semester?: string;
  academicYear?: string;
  _count?: { members: number; experiments: number };
  instructor?: { user: { name: string } };
}

export default function KelasPage() {
  const { user } = useUser();
  const role = user?.role || "STUDENT";
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", code: "", course: "" });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data.data || []);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    try {
      // Find class by code, then join
      const res = await fetch("/api/classes");
      const data = await res.json();
      const cls = (data.data || []).find((c: ClassData) => c.code === joinCode.trim());
      if (cls) {
        await fetch(`/api/classes/${cls.id}/join`, { method: "POST" });
        setJoinCode("");
        setShowJoinForm(false);
        fetchClasses();
      }
    } catch (err) {
      console.error("Failed to join class", err);
    }
  };

  const handleCreateClass = async () => {
    try {
      await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      setCreateForm({ name: "", code: "", course: "" });
      setShowCreateForm(false);
      fetchClasses();
    } catch (err) {
      console.error("Failed to create class", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelas</h1>
          <p className="text-slate-600 mt-1">
            {role === "INSTRUCTOR" ? "Kelola kelas Anda" : "Kelas yang Anda ikuti"}
          </p>
        </div>
        {role === "INSTRUCTOR" ? (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" /> Buat Kelas
          </Button>
        ) : (
          <Button onClick={() => setShowJoinForm(!showJoinForm)}>
            <Plus className="h-4 w-4 mr-2" /> Gabung Kelas
          </Button>
        )}
      </div>

      {/* Join Class Form */}
      {showJoinForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Kode Kelas</Label>
                <Input
                  placeholder="Masukkan kode kelas..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </div>
              <Button onClick={handleJoinClass}>Gabung</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Class Form */}
      {showCreateForm && role === "INSTRUCTOR" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nama Kelas</Label>
                <Input
                  placeholder="Kimia Analitik 101"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Kode Kelas</Label>
                <Input
                  placeholder="KMA101"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mata Kuliah</Label>
                <Input
                  placeholder="Kimia Analitik"
                  value={createForm.course}
                  onChange={(e) => setCreateForm({ ...createForm, course: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleCreateClass}>Buat Kelas</Button>
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat kelas...</div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Belum ada kelas.</p>
            <p className="text-sm text-slate-400 mt-1">
              {role === "INSTRUCTOR" ? "Klik 'Buat Kelas' untuk memulai." : "Klik 'Gabung Kelas' untuk bergabung."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{cls.code}</Badge>
                  <Badge variant="outline">{cls.semester || "Aktif"}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{cls.name}</CardTitle>
                <p className="text-sm text-slate-500">{cls.course}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{cls._count?.members || 0} mahasiswa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{cls._count?.experiments || 0} praktikum</span>
                  </div>
                </div>
                {cls.instructor?.user?.name && (
                  <p className="text-xs text-slate-400 mt-2">
                    Dosen: {cls.instructor.user.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
