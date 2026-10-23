"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search, RefreshCw, Atom, FlaskConical, Calculator, Loader2,
  ShieldAlert, Beaker, Scale, ArrowRight,
} from "lucide-react";

type TabType = "elements" | "compounds" | "equivalentWeight";

interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category?: string;
}

interface MolarMassResult {
  formula: string;
  molarMass: number;
  breakdown: Array<{ symbol: string; count: number; atomicMass: number; contribution: number }>;
}

export default function ChemistryPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<TabType>("elements");
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Compound lookup
  const [compoundFormula, setCompoundFormula] = useState("");
  const [compoundResult, setCompoundResult] = useState<MolarMassResult | null>(null);
  const [compoundLoading, setCompoundLoading] = useState(false);
  const [compoundError, setCompoundError] = useState("");

  // Equivalent weight
  const [eqFormula, setEqFormula] = useState("");
  const [eqValence, setEqValence] = useState("1");
  const [eqResult, setEqResult] = useState<{ molarMass: number; valence: number; equivalentWeight: number } | null>(null);
  const [eqLoading, setEqLoading] = useState(false);
  const [eqError, setEqError] = useState("");

  const fetchElements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chemistry/elements");
      const json = await res.json();
      const data = json.data || json;
      if (Array.isArray(data)) {
        setElements(data);
      } else if (data && typeof data === "object") {
        // PERIODIC_TABLE might be an object keyed by symbol
        const arr = Object.values(data) as Element[];
        setElements(arr);
      }
    } catch {
      setElements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchElements(); }, [fetchElements]);

  const filteredElements = elements.filter(el =>
    el.symbol?.toLowerCase().includes(search.toLowerCase()) ||
    el.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(el.atomicNumber).includes(search)
  );

  const categories = [...new Set(elements.map(e => e.category).filter(Boolean))];

  const lookupCompound = async () => {
    if (!compoundFormula.trim()) return;
    setCompoundLoading(true);
    setCompoundError("");
    setCompoundResult(null);
    try {
      const res = await fetch(`/api/chemistry/molar-mass?formula=${encodeURIComponent(compoundFormula)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Lookup failed");
      setCompoundResult(json.data || json);
    } catch (e: any) {
      setCompoundError(e.message);
    } finally {
      setCompoundLoading(false);
    }
  };

  const lookupEquivalent = async () => {
    if (!eqFormula.trim()) return;
    setEqLoading(true);
    setEqError("");
    setEqResult(null);
    try {
      const res = await fetch(`/api/chemistry/equivalent-weight?formula=${encodeURIComponent(eqFormula)}&valence=${eqValence}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Lookup failed");
      setEqResult(json.data || json);
    } catch (e: any) {
      setEqError(e.message);
    } finally {
      setEqLoading(false);
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chemistry Database</h1>
          <p className="text-slate-500 text-sm mt-1">Periodic table, compound lookup, and equivalent weight calculator</p>
        </div>
        <Button variant="outline" onClick={fetchElements}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Atom className="w-8 h-8 text-blue-600" /><div><p className="text-2xl font-bold">{elements.length}</p><p className="text-xs text-slate-500">Elements</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Beaker className="w-8 h-8 text-purple-600" /><div><p className="text-2xl font-bold">{categories.length}</p><p className="text-xs text-slate-500">Categories</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Scale className="w-8 h-8 text-green-600" /><div><p className="text-2xl font-bold">7</p><p className="text-xs text-slate-500">Periods</p></div></div></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(["elements", "compounds", "equivalentWeight"] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white shadow text-blue-600" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t === "elements" ? "Elements" : t === "compounds" ? "Molar Mass" : "Equivalent Weight"}
          </button>
        ))}
      </div>

      {/* Elements Tab */}
      {tab === "elements" && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search by symbol, name, or number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3">Showing {filteredElements.length} of {elements.length} elements</p>
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead className="w-20">Symbol</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Atomic Mass</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredElements.sort((a, b) => a.atomicNumber - b.atomicNumber).map(el => (
                        <TableRow key={el.symbol}>
                          <TableCell className="text-slate-500">{el.atomicNumber}</TableCell>
                          <TableCell><Badge className="bg-blue-100 text-blue-700 font-mono font-bold">{el.symbol}</Badge></TableCell>
                          <TableCell className="font-medium">{el.name}</TableCell>
                          <TableCell className="text-right font-mono">{Number(el.atomicMass).toFixed(4)}</TableCell>
                          <TableCell className="text-sm text-slate-500">{el.category || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Compound / Molar Mass Tab */}
      {tab === "compounds" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" />Molar Mass Calculator</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end mb-6">
              <div className="flex-1">
                <Label>Chemical Formula</Label>
                <Input placeholder="e.g. H2O, NaCl, H2SO4" value={compoundFormula} onChange={e => setCompoundFormula(e.target.value)} onKeyDown={e => e.key === "Enter" && lookupCompound()} />
              </div>
              <Button onClick={lookupCompound} disabled={compoundLoading}>
                {compoundLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}Calculate
              </Button>
            </div>
            {compoundError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mb-4">{compoundError}</div>}
            {compoundResult && (
              <div className="bg-slate-50 rounded-lg p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-1">{compoundResult.formula}</h4>
                <p className="text-3xl font-bold text-blue-600 mb-4">{Number(compoundResult.molarMass).toFixed(4)} g/mol</p>
                {compoundResult.breakdown && compoundResult.breakdown.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Element</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Atomic Mass</TableHead>
                        <TableHead className="text-right">Contribution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compoundResult.breakdown.map((b, i) => (
                        <TableRow key={i}>
                          <TableCell><Badge className="bg-blue-100 text-blue-700 font-mono">{b.symbol}</Badge></TableCell>
                          <TableCell className="text-right">{b.count}</TableCell>
                          <TableCell className="text-right font-mono">{Number(b.atomicMass).toFixed(4)}</TableCell>
                          <TableCell className="text-right font-mono font-bold">{Number(b.contribution).toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equivalent Weight Tab */}
      {tab === "equivalentWeight" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="w-5 h-5" />Equivalent Weight Calculator</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end mb-6">
              <div className="flex-1">
                <Label>Chemical Formula</Label>
                <Input placeholder="e.g. H2SO4" value={eqFormula} onChange={e => setEqFormula(e.target.value)} />
              </div>
              <div className="w-32">
                <Label>Valence</Label>
                <Input type="number" min="1" value={eqValence} onChange={e => setEqValence(e.target.value)} />
              </div>
              <Button onClick={lookupEquivalent} disabled={eqLoading}>
                {eqLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}Calculate
              </Button>
            </div>
            {eqError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mb-4">{eqError}</div>}
            {eqResult && (
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm text-slate-500">Molar Mass</p>
                    <p className="text-2xl font-bold text-slate-900">{Number(eqResult.molarMass).toFixed(4)}</p>
                    <p className="text-xs text-slate-400">g/mol</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Valence</p>
                    <p className="text-2xl font-bold text-slate-900">{eqResult.valence}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Equivalent Weight</p>
                    <p className="text-2xl font-bold text-blue-600">{Number(eqResult.equivalentWeight).toFixed(4)}</p>
                    <p className="text-xs text-slate-400">g/eq</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border text-sm font-mono text-center">
                  BE = Massa Molar / Valensi = {Number(eqResult.molarMass).toFixed(4)} / {eqResult.valence} = {Number(eqResult.equivalentWeight).toFixed(4)} g/eq
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
