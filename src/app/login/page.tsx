"use client";

import React, { useState, useEffect } from "react";
import { useCRM } from "@/context/CRMContext";
import { useRouter } from "next/navigation";
import { Code2, Lock, User, AlertCircle } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated, isLoading } = useCRM();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Artificial tiny delay for premium feel
    setTimeout(async () => {
      const success = await login(username, password);
      setIsSubmitting(false);
      if (success) {
        router.push("/");
      } else {
        setError("Usuário ou senha incorretos.");
      }
    }, 600);
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Title / Logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-xl shadow-violet-500/20 mb-4 scale-100 hover:scale-105 transition-transform duration-300">
            <Code2 size={24} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white text-center">
            Bem-vindo ao <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">DevCRM</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400 text-center">
            Gestão simplificada de clientes e projetos para freelancers
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Seu usuário (admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Sua senha (admin)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 flex items-center justify-center shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          <div className="flex flex-col items-center gap-1 text-[10px] text-zinc-500 font-semibold tracking-wider uppercase border-t border-zinc-850 pt-4 text-center">
            <span>Acesso Autorizado:</span>
            <span>larissa.gomes / 160725</span>
            <span>leonardo.hirt / 160725</span>
          </div>
        </div>
      </div>
    </div>
  );
}
