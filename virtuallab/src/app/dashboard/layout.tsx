"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FlaskConical, GraduationCap, History, User, FileCheck, ClipboardList, BarChart3, LogOut, Menu, X, Loader2, Calculator, ShieldAlert, Atom, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export const UserContext = createContext<{ user: any; loading: boolean }>({ user: null, loading: true });

export const useUser = () => useContext(UserContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          // Adjust based on the actual API structure
          setUser(data.user || data.data || data);
        } else {
          setUser({ name: "Demo User", role: "STUDENT" }); // Fallback if API fails
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        setUser({ name: "Demo User", role: "STUDENT" }); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const userRole = user?.role || "STUDENT";

  const studentNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kelas", href: "/dashboard/kelas", icon: Users },
    { name: "Praktikum", href: "/dashboard/praktikum", icon: FlaskConical },
    { name: "Nilai", href: "/dashboard/nilai", icon: GraduationCap },
    { name: "Riwayat", href: "/dashboard/riwayat", icon: History },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const instructorNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analitik", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Kelas", href: "/dashboard/kelas", icon: Users },
    { name: "Praktikum", href: "/dashboard/praktikum", icon: FlaskConical },
    { name: "Submissions", href: "/dashboard/submissions", icon: FileCheck },
    { name: "Grading", href: "/dashboard/grading", icon: ClipboardList },
    { name: "Laporan", href: "/dashboard/laporan", icon: BarChart3 },
  ];

  const adminNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analitik", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Kelas", href: "/dashboard/kelas", icon: Users },
    { name: "Praktikum", href: "/dashboard/praktikum", icon: FlaskConical },
    { name: "Submissions", href: "/dashboard/submissions", icon: FileCheck },
    { name: "Grading", href: "/dashboard/grading", icon: ClipboardList },
    { name: "Laporan", href: "/dashboard/laporan", icon: BarChart3 },
    { name: "Formula", href: "/dashboard/formulas", icon: Calculator },
    { name: "Users", href: "/dashboard/users", icon: UserCog },
    { name: "Chemistry DB", href: "/dashboard/chemistry", icon: Atom },
    { name: "Audit Log", href: "/dashboard/audit-log", icon: ShieldAlert },
  ];

  const navItems = userRole === "ADMIN" ? adminNav : userRole === "INSTRUCTOR" ? instructorNav : studentNav;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "U";

  // Logout: use redirect:false to prevent NextAuth from validating callbackUrl
  // against NEXTAUTH_URL (which may point to localhost). Then redirect manually.
  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  // ==========================================
  // STUDENT LAYOUT — Horizontal top navbar
  // ==========================================
  if (userRole === "STUDENT") {
    return (
      <UserContext.Provider value={{ user, loading }}>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shrink-0">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
              {/* Left: Avatar + Nav Links */}
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: '#2D2B7F' }}>
                  {getInitial(user?.name || "User")}
                </div>

                {/* Nav Links */}
                <nav className="hidden sm:flex items-center gap-5">
                  {studentNav.map((item) => {
                    const isActive = item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-sm font-medium transition ${
                          isActive
                            ? "text-slate-900 font-semibold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right: Mobile menu + Logout */}
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="sm:hidden p-2 rounded-md hover:bg-slate-100 text-slate-500"
                >
                  {collapsed ? <X size={20} /> : <Menu size={20} />}
                </button>

                <Button
                  variant="ghost"
                  onClick={() => handleLogout()}
                  className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 hidden sm:inline-flex"
                  size="sm"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile nav dropdown */}
            {collapsed && (
              <div className="sm:hidden border-t border-slate-100 bg-white px-6 py-3 space-y-1">
                {studentNav.map((item) => {
                  const isActive = item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setCollapsed(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={() => handleLogout()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </UserContext.Provider>
    );
  }

  // ==========================================
  // INSTRUCTOR / ADMIN LAYOUT — Sidebar
  // ==========================================
  return (
    <UserContext.Provider value={{ user, loading }}>
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? "w-20" : "w-64"} flex flex-col`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
            {!collapsed && <span className="font-bold text-xl text-blue-600 truncate">VirtualLab</span>}
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-md hover:bg-slate-100 text-slate-500">
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = item.href === "/dashboard" 
                  ? pathname === "/dashboard" 
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                        isActive 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <item.icon size={20} className={`shrink-0 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                      {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-slate-200 shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => handleLogout()}
              className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
            >
              <LogOut size={20} />
              {!collapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {navItems.find(item => item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href))?.name || "Dashboard"}
            </h2>
            <div className="flex items-center space-x-4 ml-auto">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  {getInitial(user?.name || "User")}
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.name || "Student"}</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
