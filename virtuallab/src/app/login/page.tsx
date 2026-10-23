"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-12 flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="z-10 flex flex-col items-center">
          <div className="bg-white/20 p-6 rounded-full mb-8 backdrop-blur-sm border border-white/30">
            <FlaskConical size={80} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-5xl font-bold mb-6 text-center tracking-tight">VirtualLab<br/>Analisis Kimia</h1>
          <p className="text-xl text-blue-50 text-center max-w-md font-light leading-relaxed">
            Platform pembelajaran interaktif terdepan untuk simulasi eksperimen dan analisis kimia modern.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-blue-50 p-3 rounded-full mb-4 lg:hidden">
              <FlaskConical size={32} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 text-center flex items-center gap-2">
              <FlaskConical className="hidden lg:block text-blue-600" size={28} />
              VIRTUAL LAB
            </h2>
            <p className="mt-2 text-center text-sm font-medium text-slate-500">
              VirtualLab Analisis Kimia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="focus-visible:ring-blue-500 border-slate-300 h-11"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="focus-visible:ring-blue-500 border-slate-300 h-11"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                "LOGIN"
              )}
            </Button>
          </form>

          <div className="flex justify-center mt-6">
            <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Lupa password?
            </Link>
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
