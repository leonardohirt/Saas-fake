"use client";

import React, { useState, useEffect } from "react";
import { useCRM, Project, Client } from "@/context/CRMContext";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  GitFork, 
  Globe, 
  Edit3, 
  Trash2, 
  X,
  ExternalLink,
  ChevronRight,
  User
} from "lucide-react";

export default function ProjetosPage() {
  const { clients, projects, addProject, updateProject, deleteProject } = useCRM();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Form fields state
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Landing Page");
  const [status, setStatus] = useState<"Novo" | "Em andamento" | "Revisão" | "Concluído">("Novo");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  // Handle URL actions
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      openCreateModal();
      router.replace("/projetos");
    }
  }, [searchParams, router]);

  // Project Types options
  const projectTypes = ["Landing Page", "Site", "E-commerce", "Web App", "Outro"];

  // Helpers
  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.name : "Desconhecido";
  };

  const getClientCompany = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.company : "-";
  };

  // Get project progress value based on status
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Novo": return 15;
      case "Em andamento": return 50;
      case "Revisão": return 85;
      case "Concluído": return 100;
      default: return 0;
    }
  };

  // Modal Openers
  const openCreateModal = () => {
    setEditingProject(null);
    setClientId(clients.length > 0 ? clients[0].id : "");
    setName("");
    setType("Landing Page");
    setStatus("Novo");
    setValue("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setDeadline("");
    setDescription("");
    setGithubLink("");
    setWebsiteLink("");
    setIsFormOpen(true);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingProject(project);
    setClientId(project.clientId);
    setName(project.name);
    setType(project.type);
    setStatus(project.status);
    setValue(project.value.toString());
    setStartDate(project.startDate);
    setDeadline(project.deadline);
    setDescription(project.description);
    setGithubLink(project.githubLink || "");
    setWebsiteLink(project.websiteLink || "");
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setProjectToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !name || !value || !startDate || !deadline) return;

    const data = {
      clientId,
      name,
      type,
      status,
      value: parseFloat(value),
      startDate,
      deadline,
      description,
      githubLink,
      websiteLink
    };

    if (editingProject) {
      let log = "";
      if (editingProject.name !== name) log += `Nome editado para '${name}'. `;
      if (editingProject.value !== parseFloat(value)) log += `Valor editado para R$ ${value}. `;
      if (editingProject.deadline !== deadline) log += `Prazo alterado para ${deadline}. `;
      
      updateProject(editingProject.id, data, log || "Projeto editado.");
    } else {
      addProject(data);
    }

    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setIsDeleteConfirmOpen(false);
      setProjectToDelete(null);
    }
  };

  // Filters application
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          getClientName(project.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesClient = clientFilter === "all" || project.clientId === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Projetos
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie os contratos de desenvolvimento, prazos e faturamento.
          </p>
        </div>

        {clients.length === 0 ? (
          <button
            disabled
            title="Cadastre um cliente primeiro"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-sm font-medium cursor-not-allowed shrink-0 border border-zinc-700"
          >
            <Plus size={16} />
            Novo Projeto
          </button>
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200 shrink-0"
          >
            <Plus size={16} />
            Novo Projeto
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-xs text-white placeholder-zinc-500 transition-all outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 w-full md:w-auto">
            <Filter size={14} className="text-zinc-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none w-full cursor-pointer pr-4"
            >
              <option value="all">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Revisão">Revisão</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 w-full md:w-auto">
            <User size={14} className="text-zinc-500 shrink-0" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none w-full cursor-pointer pr-4 max-w-[150px]"
            >
              <option value="all">Todos os Clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 border border-zinc-850 rounded-3xl text-zinc-500">
          <FolderGit2 size={56} className="text-zinc-800 mb-4 stroke-[1.2]" />
          <p className="text-sm">Nenhum projeto encontrado para estes filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isOverdue = project.status !== "Concluído" && project.deadline < todayStr;
            const progress = getProgressPercentage(project.status);
            
            return (
              <Link 
                key={project.id}
                href={`/projetos/${project.id}`}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-800/80 transition-all duration-200 group flex flex-col justify-between hover:shadow-lg hover:shadow-violet-500/[0.02]"
              >
                <div>
                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      project.status === "Concluído" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      project.status === "Revisão" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      project.status === "Em andamento" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      {project.status}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditModal(project, e)}
                        title="Editar projeto"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => openDeleteConfirm(project.id, e)}
                        title="Excluir projeto"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                      {getClientName(project.clientId)}
                    </div>
                    <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-violet-400 transition-colors">
                      {project.name}
                    </h3>
                    <div className="text-zinc-500 text-xs font-semibold pt-1">
                      Tipo: <span className="text-zinc-350">{project.type}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-850">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${
                          project.status === "Concluído" ? "from-emerald-500 to-teal-400" :
                          project.status === "Revisão" ? "from-amber-500 to-orange-400" :
                          "from-violet-500 to-indigo-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates / Price */}
                  <div className="mt-5 grid grid-cols-2 gap-4 pt-3 border-t border-zinc-850/60">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Valor</span>
                      <div className="text-xs font-bold text-zinc-300 flex items-center gap-0.5">
                        <DollarSign size={13} className="text-violet-400" />
                        <span>R$ {project.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Prazo Final</span>
                      <div className={`text-xs font-semibold flex items-center gap-1 ${
                        isOverdue ? "text-rose-400 font-bold" : "text-zinc-300"
                      }`}>
                        <Calendar size={13} className="text-zinc-500 shrink-0" />
                        <span>{new Date(project.deadline).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* External links and Navigate */}
                <div className="mt-6 flex items-center justify-between pt-3 border-t border-zinc-850/60">
                  <div className="flex items-center gap-2">
                    {project.githubLink ? (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="GitHub Repository"
                        className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors"
                      >
                        <GitFork size={14} />
                      </a>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-zinc-950/20 border border-zinc-900 text-zinc-700 cursor-not-allowed">
                        <GitFork size={14} />
                      </span>
                    )}

                    {project.websiteLink ? (
                      <a
                        href={project.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Deploy/Website"
                        className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors"
                      >
                        <Globe size={14} />
                      </a>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-zinc-950/20 border border-zinc-900 text-zinc-700 cursor-not-allowed">
                        <Globe size={14} />
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-violet-400 group-hover:text-violet-300 flex items-center gap-0.5 transition-colors">
                    Detalhes
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Edit / Create Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl animate-in scale-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingProject ? `Editar Projeto: ${editingProject.name}` : "Cadastrar Novo Projeto"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Client Selector & Project Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Cliente Contratante
                    </label>
                    <select
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl text-sm text-white transition-all outline-none cursor-pointer"
                    >
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} ({client.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Nome do Projeto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Landing Page de Inverno"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-600 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Type, Status & Value */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Tipo de Projeto
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl text-sm text-white transition-all outline-none cursor-pointer"
                    >
                      {projectTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Status Inicial
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl text-sm text-white transition-all outline-none cursor-pointer"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Revisão">Revisão</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Valor Contrato (R$)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="Ex: 3500"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-650 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl text-sm text-white transition-all outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Prazo Limite (Deadline)
                    </label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 rounded-xl text-sm text-white transition-all outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Repositório GitHub (opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="Ex: https://github.com/usuario/projeto"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-600 transition-all outline-none font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Link do Site/Vercel (opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="Ex: https://projeto.vercel.app"
                      value={websiteLink}
                      onChange={(e) => setWebsiteLink(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-600 transition-all outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Descrição do Projeto
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Escopo do projeto, especificações técnicas acordadas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-650 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-850 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-lg shadow-violet-500/10 transition-colors"
                >
                  {editingProject ? "Salvar Alterações" : "Cadastrar Projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-white">Excluir Projeto</h3>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Você tem certeza que deseja remover este projeto? 
              <br />
              Esta ação excluirá permanentemente todos os registros de histórico e anotações vinculados!
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-500/10 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
