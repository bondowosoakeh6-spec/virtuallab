"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClassesPage() {
  const userRole: string = "SISWA"; // Mock

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
          <p className="text-slate-600">Manage and view your enrolled classes</p>
        </div>
        {userRole === "PENGAJAR" ? (
          <Button>Create Class</Button>
        ) : (
          <Button>Join Class</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4">Class Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Assignments</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">Kimia Dasar I</td>
                  <td className="px-6 py-4">KMD101</td>
                  <td className="px-6 py-4">Dr. Budi</td>
                  <td className="px-6 py-4">45</td>
                  <td className="px-6 py-4">3</td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">View</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
