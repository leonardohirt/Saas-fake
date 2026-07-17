"use client";

import React, { useState, useEffect } from "react";
import { useCRM, Client, Project } from "@/context/CRMContext";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  Trash2, 
  Edit3, 
  X, 
  ExternalLink,
  ChevronRight,
  FolderKanban
} from "lucide-react";

export default function ClientesPage() {
  const { clients, projects, addClient, updateClient, deleteClient } = useCRM();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Form fields state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Handle URL actions
  useEffect(() => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "new") {
      openCreateModal();
      // Remove query params without page reload
      router.replace("/clientes");
    } else if (id) {
      const client = clients.find(c => c.id === id);
      if (client) {
        setSelectedClient(client);
      }
      router.replace("/clientes");
    }
  }, [searchParams, clients, router]);

  // Search filter
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load client projects
  const getClientProjects = (clientId: string): Project[] => {
    return projects.filter(p => p.clientId === clientId);
  };

  // Modal open helpers
  const openCreateModal = () => {
    setEditingClient(null);
    setName("");
    setCompany("");
    setWhatsapp("");
    setEmail("");
    setNotes("");
    setIsFormOpen(true);
  };

  const openEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company);
    setWhatsapp(client.whatsapp);
    setEmail(client.email);
    setNotes(client.notes);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email || !whatsapp) return;

    const data = { name, company, whatsapp, email, notes };

    if (editingClient) {
      updateClient(editingClient.id, data);
      // Update local detailed view if open
      if (selectedClient?.id === editingClient.id) {
        setSelectedClient({ ...selectedClient, ...data });
      }
    } else {
      addClient(data);
    }

    setIsFormOpen(false);
  };

  // Delete Action
  const handleDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      if (selectedClient?.id === clientToDelete) {
        setSelectedClient(null);
      }
      setIsDeleteConfirmOpen(false);
      setClientToDelete(null);
    }
  };

  // Generate WhatsApp chat link
  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return `https://wa.me/55${cleanPhone}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Gestão de Clientes
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Cadastre, edite e acompanhe os dados de contato de seus clientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-200 shrink-0"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left / Center: Clients List (2 Cols if detail selected, 3 Cols if not) */}
        <div className={`space-y-4 min-h-0 flex flex-col ${selectedClient ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, empresa ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-500 transition-all outline-none"
            />
          </div>

          {/* Client Cards Grid */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-3 max-h-[calc(100vh-280px)]">
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl text-zinc-500">
                <Users size={48} className="text-zinc-700 mb-3 stroke-[1.25]" />
                <p className="text-sm">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map((client) => {
                  const clientProjs = getClientProjects(client.id);
                  const isSelected = selectedClient?.id === client.id;
                  
                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? "bg-violet-950/20 border-violet-500/50 shadow-md shadow-violet-500/5"
                          : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-800"
                      }`}
                    >
                      <div>
                        {/* Title and Action Buttons */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-white text-base group-hover:text-violet-400 transition-colors leading-snug">
                              {client.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mt-1">
                              <Building2 size={13} className="text-zinc-500" />
                              <span>{client.company}</span>
                            </div>
                          </div>
                          
                          {/* Card Actions */}
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => openEditModal(client, e)}
                              title="Editar cliente"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => openDeleteConfirm(client.id, e)}
                              title="Excluir cliente"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Quick Contacts */}
                        <div className="mt-4 space-y-2 text-xs text-zinc-400">
                          <a
                            href={`mailto:${client.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                          >
                            <Mail size={13} className="text-zinc-500" />
                            <span className="truncate">{client.email}</span>
                          </a>
                          <a
                            href={getWhatsAppLink(client.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                          >
                            <Phone size={13} className="text-zinc-500" />
                            <span className="font-mono">
                              {client.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}
                            </span>
                          </a>
                        </div>
                      </div>

                      {/* Footer Badge: Projects Count */}
                      <div className="mt-5 pt-3 border-t border-zinc-850/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Projetos vinculados:</span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 font-bold">
                          {clientProjs.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed Client Info Panel */}
        {selectedClient && (
          <div className="lg:col-span-1 rounded-2xl bg-zinc-900/40 border border-zinc-850 backdrop-blur-sm p-6 space-y-6 flex flex-col max-h-[calc(100vh-210px)] overflow-y-auto animate-in slide-in-from-right duration-250">
            {/* Header / Close */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-850">
              <div>
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Visualizando Detalhes</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{selectedClient.name}</h2>
                <p className="text-xs text-zinc-400">{selectedClient.company}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Complete Data */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">E-mail Comercial</span>
                <div className="flex items-center gap-2 text-sm text-zinc-200">
                  <Mail size={14} className="text-zinc-500" />
                  <span>{selectedClient.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">WhatsApp</span>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-zinc-500" />
                  <a
                    href={getWhatsAppLink(selectedClient.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-mono flex items-center gap-1"
                  >
                    {selectedClient.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Observações</span>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300 text-xs leading-relaxed flex gap-2">
                    <FileText size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                    <p className="whitespace-pre-wrap">{selectedClient.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Linked Projects */}
            <div className="space-y-3 pt-4 border-t border-zinc-850">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <FolderKanban size={14} className="text-violet-400" />
                Projetos do Cliente ({getClientProjects(selectedClient.id).length})
              </h3>
              
              <div className="space-y-2">
                {getClientProjects(selectedClient.id).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">Sem projetos criados para este cliente.</p>
                ) : (
                  getClientProjects(selectedClient.id).map(proj => (
                    <div 
                      key={proj.id}
                      onClick={() => router.push(`/projetos/${proj.id}`)}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-800 hover:bg-zinc-900/50 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-violet-400 transition-colors truncate block max-w-[150px]">
                          {proj.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">{proj.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          proj.status === "Concluído" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          proj.status === "Revisão" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          proj.status === "Em andamento" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" :
                          "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}>
                          {proj.status}
                        </span>
                        <ChevronRight size={14} className="text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick action bar inside sidebar details */}
            <div className="pt-4 border-t border-zinc-850 flex gap-2">
              <button
                onClick={(e) => openEditModal(selectedClient, e)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Edit3 size={12} />
                Editar Cadastro
              </button>
              <button
                onClick={(e) => openDeleteConfirm(selectedClient.id, e)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/20 border border-red-900/30 hover:bg-red-900/20 text-red-400 rounded-lg text-xs font-semibold transition-colors"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Create Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in scale-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-850 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingClient ? `Editar Cliente: ${editingClient.name}` : "Cadastrar Novo Cliente"}
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
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ana Souza"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-650 transition-all outline-none"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Empresa / Marca
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Estúdio Shine"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-650 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Apenas números. Ex: 11999998888"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-650 transition-all outline-none font-mono"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      E-mail Comercial
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: contato@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-850 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-sm text-white placeholder-zinc-650 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Observações / Anotações
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detalhes adicionais, preferências de contato, termos comerciais..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                  {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
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
            <h3 className="text-lg font-bold text-white">Excluir Cliente</h3>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Você tem certeza que deseja remover este cliente? 
              <br />
              <strong className="text-red-400 font-semibold">Aviso:</strong> Isto também excluirá permanentemente todos os projetos e históricos vinculados a ele!
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setClientToDelete(null);
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
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
