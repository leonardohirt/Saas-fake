"use client";

import React, { useState, useEffect } from "react";
import { useCRM } from "@/context/CRMContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  FolderGit2, 
  LogOut, 
  Menu, 
  X,
  Code2
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, isLoading } = useCRM();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Prevent flash of content
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-zinc-400">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Kanban", href: "/kanban", icon: Kanban },
    { name: "Projetos", href: "/projetos", icon: FolderGit2 },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800/60 shrink-0">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800/60">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/10">
            <Code2 size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-none bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">DevCRM</h1>
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Freelance Hub</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-zinc-800 text-white border-l-2 border-violet-500"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <Icon size={18} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-violet-400" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/50">
          <div className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 font-semibold text-xs text-violet-400 border border-zinc-700">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-200">Administrador</span>
                <span className="text-[10px] text-zinc-500">admin@devcrm.io</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sair do sistema"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu & Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 h-16 bg-zinc-900 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md">
              <Code2 size={16} />
            </div>
            <span className="font-bold text-sm tracking-wide">DevCRM</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Mobile Drawer (Menu Overlay) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-zinc-950/80 backdrop-blur-sm">
            <div className="w-72 bg-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-250 border-r border-zinc-800">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-zinc-850">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white">
                      <Code2 size={16} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">DevCRM</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="mt-8 space-y-1.5">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-zinc-800 text-white border-l-2 border-violet-500"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-violet-400" : "text-zinc-400"} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-zinc-850">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 font-semibold text-xs text-violet-400 border border-zinc-700">
                      AD
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-200">Administrador</span>
                      <span className="text-[10px] text-zinc-500">admin@devcrm.io</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Dashboard */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
