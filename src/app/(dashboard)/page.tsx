"use client";

import React, { useState } from "react";
import { useCRM, Project, Client } from "@/context/CRMContext";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  TrendingUp,
  FolderKanban,
  FileCode,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  const { clients, projects, currentUser } = useCRM();

  const getGreeting = (username: string | null) => {
    if (username === "leonardo.hirt") return "Olá, Desenvolvedor Leonardo";
    if (username === "larissa.gomes") return "Olá, Desenvolvedora Larissa";
    return "Olá, Desenvolvedor(a)";
  };

  // Metrics calculations
  const totalClients = clients.length;
  const inProgressProjects = projects.filter(p => p.status === "Em andamento").length;
  const completedProjects = projects.filter(p => p.status === "Concluído").length;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const delayedProjects = projects.filter(p => {
    return p.status !== "Concluído" && p.deadline < todayStr;
  }).length;

  const totalRevenue = projects
    .filter(p => p.status === "Concluído")
    .reduce((sum, p) => sum + p.value, 0);

  const activeRevenue = projects
    .filter(p => p.status !== "Concluído")
    .reduce((sum, p) => sum + p.value, 0);

  // Sorting recent clients
  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Sorting recent projects
  const recentProjects = [...projects]
    .filter(p => p.status !== "Concluído")
    .slice(0, 3);

  // Helper to find client name
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Desconhecido";
  };

  const getClientCompany = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.company : "-";
  };

  // Quick Stats config
  const stats = [
    {
      name: "Total de Clientes",
      value: totalClients,
      icon: Users,
      color: "from-blue-600/20 to-blue-500/10 border-blue-500/20 text-blue-400",
      description: "Clientes cadastrados"
    },
    {
      name: "Em Andamento",
      value: inProgressProjects,
      icon: Briefcase,
      color: "from-violet-600/20 to-violet-500/10 border-violet-500/20 text-violet-400",
      description: "Projetos em execução"
    },
    {
      name: "Concluídos",
      value: completedProjects,
      icon: CheckCircle2,
      color: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/20 text-emerald-400",
      description: "Entregues com sucesso"
    },
    {
      name: "Atrasados",
      value: delayedProjects,
      icon: AlertCircle,
      color: delayedProjects > 0 
        ? "from-rose-600/25 to-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse" 
        : "from-zinc-800/40 to-zinc-800/10 border-zinc-800 text-zinc-500",
      description: "Passaram do prazo"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            {getGreeting(currentUser)}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Aqui está o resumo da sua operação freelance hoje.
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/clientes?action=new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 text-zinc-300"
          >
            <Plus size={16} />
            Novo Cliente
          </Link>
          <Link
            href="/projetos?action=new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200"
          >
            <Plus size={16} />
            Novo Projeto
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i}
              className={`p-6 rounded-2xl bg-gradient-to-br border backdrop-blur-sm ${stat.color} transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{stat.name}</span>
                <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-850">
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Finance & Progress Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial metrics card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <DollarSign size={14} className="text-violet-400" />
              Resumo Financeiro
            </div>
            
            <div className="mt-6 space-y-5">
              <div>
                <span className="text-zinc-500 text-xs font-medium">Faturamento Concluído</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-medium">Faturamento em Pipeline</span>
                <div className="text-2xl font-bold text-violet-400 mt-1">
                  R$ {activeRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Conversão estimada</span>
            <span className="text-zinc-300 flex items-center gap-1 font-bold">
              <TrendingUp size={14} className="text-emerald-400" />
              100% via LocalStorage
            </span>
          </div>
        </div>

        {/* Recent Projects preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <FolderKanban size={16} className="text-violet-400" />
              Projetos em Andamento Recentes
            </h2>
            <Link 
              href="/kanban" 
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Ver Kanban
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-sm">
                <FileCode size={32} className="text-zinc-700 mb-2 stroke-[1.5]" />
                Nenhum projeto ativo no momento.
              </div>
            ) : (
              recentProjects.map((project) => {
                const isOverdue = project.status !== "Concluído" && project.deadline < todayStr;
                return (
                  <div 
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 transition-colors"
                  >
                    <div className="space-y-1">
                      <Link 
                        href={`/projetos/${project.id}`}
                        className="text-sm font-bold text-white hover:text-violet-400 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 font-medium">
                        <span>{getClientName(project.clientId)}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">
                          {project.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-zinc-300">
                        R$ {project.value.toLocaleString("pt-BR")}
                      </div>
                      <div className={`text-[10px] font-medium mt-1 ${isOverdue ? "text-rose-400 font-bold" : "text-zinc-500"}`}>
                        Prazo: {new Date(project.deadline).toLocaleDateString("pt-BR")} {isOverdue && "(Atrasado)"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Clients Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Users size={16} className="text-violet-400" />
            Clientes Adicionados Recentemente
          </h2>
          <Link 
            href="/clientes" 
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          {recentClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-sm">
              <Users size={32} className="text-zinc-700 mb-2 stroke-[1.5]" />
              Nenhum cliente cadastrado ainda.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-xs text-zinc-500 uppercase font-semibold">
                  <th className="pb-3 pl-2">Nome</th>
                  <th className="pb-3">Empresa</th>
                  <th className="pb-3">E-mail</th>
                  <th className="pb-3">WhatsApp</th>
                  <th className="pb-3 text-right pr-2">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50 text-sm">
                {recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="py-3.5 pl-2 font-bold text-white group-hover:text-violet-400 transition-colors">
                      <Link href={`/clientes?id=${client.id}`}>
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-3.5 text-zinc-300">{client.company}</td>
                    <td className="py-3.5 text-zinc-400">{client.email}</td>
                    <td className="py-3.5 text-zinc-400 font-mono">
                      {client.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}
                    </td>
                    <td className="py-3.5 text-zinc-500 text-right pr-2 font-medium">
                      {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
