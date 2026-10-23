"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Beaker, PlayCircle, ArrowRight } from "lucide-react";
import { EXPERIMENT_DEFINITIONS } from "@/lib/calculations/experiment-engine";

export default function PraktikumListPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Praktikum</h1>
          <p className="text-muted-foreground mt-2">
            Pilih modul praktikum yang ingin Anda kerjakan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(EXPERIMENT_DEFINITIONS).map((exp) => (
          <Card key={exp.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FlaskConical className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Tersedia
                </Badge>
              </div>
              <CardTitle className="text-xl">{exp.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {(exp as any).description || exp.objective || ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Tujuan:</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                    {(Array.isArray((exp as any).objectives) ? (exp as any).objectives : [exp.objective]).slice(0, 2).map((obj: any, i: any) => (
                      <li key={i} className="line-clamp-1">{obj}</li>
                    ))}
                    {(Array.isArray((exp as any).objectives) ? (exp as any).objectives : []).length > 2 && (
                      <li className="list-none text-xs italic">+{(exp as any).objectives.length - 2} lagi</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Link href={`/dashboard/praktikum/${exp.type}`} className="w-full">
                <Button className="w-full gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Mulai Praktikum
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
