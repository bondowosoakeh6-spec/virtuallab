"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "../layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Search, RefreshCw, Plus, Edit, Trash2, ShieldCheck, ShieldAlert,
  Users, UserPlus, GraduationCap, BookOpen, X, Loader2, AlertCircle,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  INSTRUCTOR: "bg-blue-100 text-blue-700",
  STUDENT: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  SUSPENDED: "bg-amber-100 text-amber-700",
};

export default function UsersPage() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STUDENT", studentNumber: "", employeeNumber: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (json.data) {
        let filtered = json.data.users || [];
        if (statusFilter) filtered = filtered.filter((u: UserData) => u.status === statusFilter);
        setUsers(filtered);
        setTotal(json.data.total || 0);
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const stats = {
    total,
    admins: users.filter(u => u.role === "ADMIN").length,
    instructors: users.filter(u => u.role === "INSTRUCTOR").length,
    students: users.filter(u => u.role === "STUDENT").length,
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "STUDENT", studentNumber: "", employeeNumber: "" });
    setShowModal(true);
    setError("");
  };

  const openEdit = (u: UserData) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role, studentNumber: "", employeeNumber: "" });
    setShowModal(true);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingUser) {
        const body: any = { name: formData.name, status: undefined };
        if (formData.name !== editingUser.name) body.name = formData.name;
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message || "Update failed"); }
      } else {
        const body: any = { name: formData.name, email: formData.email, password: formData.password, role: formData.role };
        if (formData.role === "STUDENT") body.studentNumber = formData.studentNumber || `STU-${Date.now()}`;
        if (formData.role === "INSTRUCTOR") body.employeeNumber = formData.employeeNumber || `INS-${Date.now()}`;
        const res = await fetch("/api/users", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message || "Create failed"); }
      }
      setShowModal(false);
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: UserData) => {
    const newStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await fetch(`/api/users/${u.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchUsers();
    } catch { /* ignore */ }
  };

  const deleteUser = async (u: UserData) => {
    if (!confirm(`Deactivate user "${u.name}"?`)) return;
    try {
      await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      fetchUsers();
    } catch { /* ignore */ }
  };

  if (currentUser?.role !== "ADMIN") {
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
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all system users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={openCreate}><UserPlus className="w-4 h-4 mr-2" />Add User</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-blue-600" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-slate-500">Total Users</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ShieldCheck className="w-8 h-8 text-red-500" /><div><p className="text-2xl font-bold">{stats.admins}</p><p className="text-xs text-slate-500">Admins</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BookOpen className="w-8 h-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.instructors}</p><p className="text-xs text-slate-500">Instructors</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><GraduationCap className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.students}</p><p className="text-xs text-slate-500">Students</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
              </div>
            </div>
            <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="STUDENT">Student</option>
            </Select>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell><Badge className={ROLE_COLORS[u.role]}>{u.role}</Badge></TableCell>
                    <TableCell><Badge className={STATUS_COLORS[u.status]}>{u.status}</Badge></TableCell>
                    <TableCell className="text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)} title="Edit"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleStatus(u)} title={u.status === "ACTIVE" ? "Suspend" : "Activate"}>
                          {u.status === "ACTIVE" ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(u)} title="Deactivate"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-slate-500">Page {page} of {Math.ceil(total / 20)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingUser ? "Edit User" : "Create User"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
              {!editingUser && (
                <>
                  <div><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Password</Label><Input type="password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} /></div>
                  <div><Label>Role</Label>
                    <Select value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}>
                      <option value="STUDENT">Student</option>
                      <option value="INSTRUCTOR">Instructor</option>
                      <option value="ADMIN">Admin</option>
                    </Select>
                  </div>
                  {formData.role === "STUDENT" && <div><Label>Student Number</Label><Input value={formData.studentNumber} onChange={e => setFormData(f => ({ ...f, studentNumber: e.target.value }))} placeholder="e.g. 2024001" /></div>}
                  {formData.role === "INSTRUCTOR" && <div><Label>Employee Number</Label><Input value={formData.employeeNumber} onChange={e => setFormData(f => ({ ...f, employeeNumber: e.target.value }))} placeholder="e.g. NIP001" /></div>}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingUser ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
