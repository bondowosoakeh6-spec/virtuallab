"use client";

import { useState } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, GraduationCap, Building2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "U";
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "STUDENT": return "Mahasiswa";
      case "INSTRUCTOR": return "Dosen";
      case "ADMIN": return "Administrator";
      default: return role;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600 mt-1">Informasi akun Anda</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold">
              {getInitial(user?.name || "U")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || "User"}</h2>
              <Badge className="mt-1">{getRoleLabel(user?.role || "STUDENT")}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium">{user?.email || "-"}</p>
              </div>
            </div>

            {user?.student && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <GraduationCap className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">NIM</p>
                  <p className="font-medium">{user.student.studentNumber}</p>
                </div>
              </div>
            )}

            {user?.student?.program && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Building2 className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Program Studi</p>
                  <p className="font-medium">{user.student.program}</p>
                </div>
              </div>
            )}

            {user?.instructor && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <GraduationCap className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">NIP</p>
                  <p className="font-medium">{user.instructor.employeeNumber || "-"}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
