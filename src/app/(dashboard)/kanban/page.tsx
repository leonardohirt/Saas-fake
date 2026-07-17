"use client";

import React, { useState } from "react";
import { useCRM, Project } from "@/context/CRMContext";
import Link from "next/link";
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  FolderKanban, 
  ArrowUpRight,
  PlusCircle,
  FileCode
} from "lucide-react";

export default function KanbanPage() {
  const { clients, projects, updateProject } = useCRM();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns: { name: string; status: Project["status"]; color: string; border: string; bg: string }[] = [
    { 
      name: "Novo", 
      status: "Novo", 
      color: "text-zinc-400 bg-zinc-800 border-zinc-700",
      border: "hover:border-zinc-700 focus-within:border-zinc-700",
      bg: "bg-zinc-900/20"
    },
    { 
      name: "Em Andamento", 
      status: "Em andamento", 
      color: "text-violet-400 bg-violet-950/30 border-violet-800/40",
      border: "hover:border-violet-800/40 focus-within:border-violet-800/40",
      bg: "bg-violet-950/5"
    },
    { 
      name: "Revisão", 
      status: "Revisão", 
      color: "text-amber-400 bg-amber-950/30 border-amber-800/40",
      border: "hover:border-amber-800/40 focus-within:border-amber-800/40",
      bg: "bg-amber-950/5"
    },
    { 
      name: "Concluído", 
      status: "Concluído", 
      color: "text-emerald-400 bg-emerald-950/30 border-emerald-800/40",
      border: "hover:border-emerald-800/40 focus-within:border-emerald-800/40",
      bg: "bg-emerald-950/5"
    }
  ];

  // Helper to fetch client name
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Desconhecido";
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("projectId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Project["status"]) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project && project.status !== targetStatus) {
        updateProject(projectId, { status: targetStatus });
      }
    }
    setDragOverColumn(null);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Quadro Kanban
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Arraste e solte os cartões para atualizar o andamento de cada projeto.
          </p>
        </div>

        <Link
          href="/projetos?action=new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200 shrink-0"
        >
          <Plus size={16} />
          Novo Projeto
        </Link>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colProjects = projects.filter((p) => p.status === col.status);
          const isDraggingOver = dragOverColumn === col.status;
          
          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex flex-col rounded-2xl p-4 border transition-all duration-250 ${col.bg} ${
                isDraggingOver 
                  ? "border-violet-500/50 bg-violet-950/10 shadow-lg shadow-violet-500/5 ring-1 ring-violet-500/20" 
                  : "border-zinc-900/60"
              } h-full min-w-[260px] max-h-[calc(100vh-220px)]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider text-zinc-350`}>
                    {col.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.color} border`}>
                    {colProjects.length}
                  </span>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-0">
                {colProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-zinc-850/50 text-zinc-650 h-32">
                    <FileCode size={20} className="mb-1.5 stroke-[1.25]" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Sem projetos</span>
                  </div>
                ) : (
                  colProjects.map((project) => {
                    const isOverdue = project.status !== "Concluído" && project.deadline < todayStr;
                    
                    return (
                      <div
                        key={project.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, project.id)}
                        className="bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:bg-zinc-900 transition-all duration-150 group shadow-md shadow-black/10 relative overflow-hidden"
                      >
                        {/* Glow indicator on side */}
                        <div className={`absolute top-0 bottom-0 left-0 w-[3px] ${
                          project.status === "Concluído" ? "bg-emerald-500" :
                          project.status === "Revisão" ? "bg-amber-500" :
                          project.status === "Em andamento" ? "bg-violet-500" :
                          "bg-zinc-600"
                        }`}></div>

                        {/* Top Line */}
                        <div className="flex items-start justify-between gap-1.5 pl-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-750">
                            {project.type}
                          </span>
                          
                          <Link 
                            href={`/projetos/${project.id}`}
                            title="Ir para a página do projeto"
                            className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                          >
                            <ArrowUpRight size={13} />
                          </Link>
                        </div>

                        {/* Title & Client */}
                        <div className="mt-3 space-y-1 pl-1.5">
                          <h4 className="font-bold text-white text-xs leading-snug group-hover:text-violet-400 transition-colors">
                            {project.name}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-semibold block">
                            {getClientName(project.clientId)}
                          </span>
                        </div>

                        {/* Footer details */}
                        <div className="mt-4 pt-3 border-t border-zinc-850/50 flex items-center justify-between text-[10px] text-zinc-400 pl-1.5">
                          <div className={`flex items-center gap-1 font-medium ${
                            isOverdue ? "text-rose-400 font-bold" : "text-zinc-500"
                          }`}>
                            <Calendar size={11} className="text-zinc-600" />
                            <span>{new Date(project.deadline).toLocaleDateString("pt-BR")}</span>
                          </div>
                          
                          <div className="font-bold text-zinc-350 flex items-center">
                            <DollarSign size={11} className="text-violet-500" />
                            <span>R$ {project.value.toLocaleString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
