"use client";

import React, { useState, useEffect, use } from "react";
import { useCRM, Project, Client, HistoryEntry } from "@/context/CRMContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  GitFork, 
  Globe, 
  Edit3, 
  FileText, 
  User, 
  Clock, 
  Save, 
  CheckCircle2, 
  Phone, 
  Mail,
  AlertCircle,
  Code
} from "lucide-react";

export default function ProjetoDetalhes({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;

  const { 
    projects, 
    clients, 
    history, 
    updateProject, 
    addHistoryEntry 
  } = useCRM();
  
  const router = useRouter();

  // Find project and client
  const project = projects.find(p => p.id === projectId);
  const client = project ? clients.find(c => c.id === project.clientId) : null;
  const projectHistory = history.filter(h => h.projectId === projectId);

  // Notes state
  const [notes, setNotes] = useState("");
  const [isNotesSaved, setIsNotesSaved] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // Populate initial notes
  useEffect(() => {
    if (project) {
      setNotes(project.description);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <AlertCircle size={48} className="text-zinc-700 mb-3" />
        <p className="text-sm">Projeto não encontrado.</p>
        <button
          onClick={() => router.push("/projetos")}
          className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs hover:bg-zinc-700 transition-colors"
        >
          Voltar para Projetos
        </button>
      </div>
    );
  }

  // Update Status directly
  const handleStatusChange = (newStatus: Project["status"]) => {
    updateProject(project.id, { status: newStatus });
  };

  // Save notes handler
  const handleSaveNotes = () => {
    if (notes === project.description) return;
    
    updateProject(project.id, { description: notes }, "Anotações do projeto atualizadas.");
    setIsNotesSaved(true);
    setSaveStatus("Salvo com sucesso!");
    
    setTimeout(() => {
      setSaveStatus("");
    }, 2500);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsNotesSaved(false);
  };

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return "";
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/55${cleanPhone}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = project.status !== "Concluído" && project.deadline < todayStr;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back link & Title header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Voltar"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
              Detalhes do Projeto
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
              {project.name}
            </h1>
          </div>
        </div>

        {/* Status quick select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-semibold uppercase">Status:</span>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl focus:border-violet-500 focus:outline-none cursor-pointer pr-8 font-semibold"
          >
            <option value="Novo">Novo</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Revisão">Revisão</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Key specs & Client Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Specs */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-5">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-850 pb-2 flex items-center gap-1.5">
              <Code size={14} className="text-violet-400" />
              Especificações
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Tipo</span>
                <span className="text-xs font-semibold text-zinc-250 bg-zinc-950 px-2.5 py-1 border border-zinc-850 rounded-lg inline-block mt-1">
                  {project.type}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Valor Contrato</span>
                <div className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center">
                  <DollarSign size={14} />
                  <span>R$ {project.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Data de Início</span>
                <div className="text-xs font-semibold text-zinc-300 mt-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-zinc-500" />
                  <span>{new Date(project.startDate).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Prazo Final</span>
                <div className={`text-xs font-semibold mt-1 flex items-center gap-1.5 ${
                  isOverdue ? "text-rose-400 font-bold" : "text-zinc-300"
                }`}>
                  <Calendar size={13} className="text-zinc-500" />
                  <span>{new Date(project.deadline).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>

            {/* Project repository and deploy links */}
            <div className="pt-4 border-t border-zinc-850 space-y-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Links de Acesso</span>
              
              <div className="flex flex-col gap-2">
                {project.githubLink ? (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GitFork size={14} className="text-zinc-400" />
                      <span>Repositório GitHub</span>
                    </div>
                    <Globe size={12} className="text-zinc-500" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950/20 border border-zinc-900 text-zinc-600 text-xs cursor-not-allowed">
                    <GitFork size={14} />
                    <span>Nenhum GitHub associado</span>
                  </div>
                )}

                {project.websiteLink ? (
                  <a
                    href={project.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-zinc-400" />
                      <span>Site no ar (Vercel)</span>
                    </div>
                    <Globe size={12} className="text-zinc-500" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950/20 border border-zinc-900 text-zinc-600 text-xs cursor-not-allowed">
                    <Globe size={14} />
                    <span>Nenhum link associado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Client Details */}
          {client ? (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-4">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                <User size={14} className="text-violet-400" />
                Dados do Cliente
              </h2>

              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{client.name}</h3>
                <span className="text-[10px] text-zinc-400 font-semibold">{client.company}</span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 pt-1">
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                >
                  <Mail size={13} className="text-zinc-500 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </a>
                
                <a
                  href={getWhatsAppLink(client.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:underline"
                >
                  <Phone size={13} className="text-zinc-500 shrink-0" />
                  <span className="font-mono">
                    {client.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}
                  </span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 text-zinc-500 text-center text-xs">
              Cliente associado não cadastrado ou removido.
            </div>
          )}
        </div>

        {/* Right column: Notes & History logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-violet-400" />
                Descrição e Anotações do Projeto
              </h2>

              <div className="flex items-center gap-3">
                {saveStatus && (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {saveStatus}
                  </span>
                )}
                <button
                  onClick={handleSaveNotes}
                  disabled={isNotesSaved}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    isNotesSaved
                      ? "bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800"
                      : "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/10 cursor-pointer"
                  }`}
                >
                  <Save size={12} />
                  Salvar
                </button>
              </div>
            </div>

            <textarea
              className="w-full min-h-[160px] p-4 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-zinc-200 placeholder-zinc-650 transition-all outline-none resize-none leading-relaxed"
              placeholder="Descreva detalhes específicos do projeto, anotações de reuniões, regras de negócio ou tarefas a fazer..."
              value={notes}
              onChange={handleNotesChange}
            />
          </div>

          {/* History log list */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <Clock size={14} className="text-violet-400" />
              Histórico de Mudanças
            </h2>

            <div className="relative border-l border-zinc-800 pl-4 space-y-4 ml-2.5 max-h-[300px] overflow-y-auto pr-2">
              {projectHistory.length === 0 ? (
                <p className="text-xs text-zinc-650 italic pl-1">Sem histórico de atividades registrado.</p>
              ) : (
                projectHistory.map((log) => {
                  const formattedTime = new Date(log.timestamp).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 flex h-2 w-2 rounded-full bg-violet-500 ring-4 ring-zinc-950"></span>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{log.action}</span>
                          <span className="text-[9px] text-zinc-500 font-semibold">{formattedTime}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{log.details}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
