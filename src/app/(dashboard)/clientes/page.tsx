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
  ChevronLeft,
  FolderKanban,
  ClipboardList
} from "lucide-react";

export default function ClientesPage() {
  const { clients, projects, addClient, updateClient, deleteClient, briefings, saveBriefing } = useCRM();
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

  // Briefing modal states
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [briefingClient, setBriefingClient] = useState<Client | null>(null);
  const [briefingForm, setBriefingForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState(1);
  const [isSavingBriefing, setIsSavingBriefing] = useState(false);

  // Form fields state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const hasBriefing = (clientId: string) => {
    return briefings && briefings[clientId] !== undefined;
  };

  const openBriefingModal = (client: Client) => {
    setBriefingClient(client);
    const existing = briefings[client.id] || {};
    setBriefingForm({
      businessName: existing.businessName || client.company || "",
      businessTime: existing.businessTime || "",
      mainProduct: existing.mainProduct || "",
      differentiator: existing.differentiator || "",
      mainCustomers: existing.mainCustomers || "",
      history: existing.history || "",
      brandEssence: existing.brandEssence || "",
      
      goals: existing.goals || [],
      goalsOther: existing.goalsOther || "",
      expectations: existing.expectations || "",
      missingDigital: existing.missingDigital || "",
      
      targetAudience: existing.targetAudience || "",
      targetRegion: existing.targetRegion || "",
      targetProfile: existing.targetProfile || "",
      whoLooksFor: existing.whoLooksFor || "",
      whoToConquer: existing.whoToConquer || "",
      
      pages: existing.pages || [],
      essentialInfo: existing.essentialInfo || "",
      referencesSites: existing.referencesSites || "",
      
      materials: existing.materials || [],
      materialsStatus: existing.materialsStatus || "",
      needHelpContent: existing.needHelpContent || false,
      
      brandColors: existing.brandColors || "",
      visualStyle: existing.visualStyle || "",
      colorsRepresentation: existing.colorsRepresentation || "",
      visualReferences: existing.visualReferences || "",
      
      features: existing.features || [],
      featuresSpecific: existing.featuresSpecific || "",
      clientAction: existing.clientAction || "",
      
      hasDomain: existing.hasDomain || "",
      hasHosting: existing.hasHosting || "",
      domainHostingOption: existing.domainHostingOption || "",
      domainHostingNotes: existing.domainHostingNotes || "",
      
      desiredDate: existing.desiredDate || "",
      launchEvents: existing.launchEvents || "",
      
      proposalItems: existing.proposalItems || [],
      investmentNotes: existing.investmentNotes || "",
      
      nextSteps: existing.nextSteps || [],
      nextStepsNotes: existing.nextStepsNotes || ""
    });
    setActiveTab(1);
    setIsBriefingOpen(true);
  };

  const toggleArrayField = (fieldName: string, value: string) => {
    setBriefingForm((prev: any) => {
      const current = prev[fieldName] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [fieldName]: updated };
    });
  };

  const handleSaveBriefing = async () => {
    if (!briefingClient) return;
    setIsSavingBriefing(true);
    await saveBriefing(briefingClient.id, briefingForm);
    setIsSavingBriefing(false);
    setIsBriefingOpen(false);
  };

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
                            <h3 className="font-bold text-white text-base group-hover:text-violet-400 transition-colors leading-snug flex items-center gap-2">
                              {client.name}
                              {hasBriefing(client.id) && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[9px] font-semibold uppercase tracking-wider shrink-0">
                                  <ClipboardList size={10} />
                                  Reunião Feita
                                </span>
                              )}
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

            {/* Briefing Action Button */}
            <button
              onClick={() => openBriefingModal(selectedClient)}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 ${
                hasBriefing(selectedClient.id)
                  ? "bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30"
                  : "bg-zinc-800 hover:bg-zinc-750 border-zinc-750 text-zinc-200"
              }`}
            >
              <ClipboardList size={14} />
              {hasBriefing(selectedClient.id) ? "Ver / Editar Briefing" : "Preencher Briefing de Reunião"}
            </button>

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

      {/* Client Briefing Modal */}
      {isBriefingOpen && briefingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-violet-400" size={20} />
                <div>
                  <h2 className="text-base font-bold text-white">
                    Briefing de Reunião: {briefingClient.name}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Preencha o roteiro de perguntas para classificação e escopo do site.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBriefingOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body: 2 Columns */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Column: Navigation Tabs */}
              <div className="w-64 border-r border-zinc-850 overflow-y-auto bg-zinc-950/25 shrink-0 hidden md:block">
                <nav className="p-4 space-y-1">
                  {[
                    { id: 1, label: "1. O Negócio" },
                    { id: 2, label: "2. Objetivos" },
                    { id: 3, label: "3. Público-Alvo" },
                    { id: 4, label: "4. Estrutura" },
                    { id: 5, label: "5. Conteúdos" },
                    { id: 6, label: "6. Visual" },
                    { id: 7, label: "7. Recursos" },
                    { id: 8, label: "8. Hospedagem" },
                    { id: 9, label: "9. Prazo" },
                    { id: 10, label: "10. Investimento" },
                    { id: 11, label: "11. Passos Finais" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === tab.id
                          ? "bg-violet-950/30 text-violet-400 border border-violet-500/20"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/40 border border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right Column: Active Tab Content Fields */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Tab 1: Conhecendo o Negócio */}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">1. Conhecendo o Negócio</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Nome da Empresa / Marca</label>
                        <input
                          type="text"
                          value={briefingForm.businessName || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, businessName: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Tempo de Mercado</label>
                          <input
                            type="text"
                            placeholder="Ex: 5 anos, recém-inaugurada..."
                            value={briefingForm.businessTime || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, businessTime: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Diferencial da Empresa</label>
                          <input
                            type="text"
                            value={briefingForm.differentiator || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, differentiator: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Principal Produto ou Serviço</label>
                          <input
                            type="text"
                            value={briefingForm.mainProduct || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, mainProduct: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Quem são os principais clientes?</label>
                          <input
                            type="text"
                            value={briefingForm.mainCustomers || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, mainCustomers: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Pode me contar um pouco sobre a história da empresa?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.history || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, history: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500 whitespace-pre-wrap"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"O que vocês gostariam que uma pessoa entendesse logo ao conhecer a marca?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.brandEssence || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, brandEssence: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500 whitespace-pre-wrap"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Objetivo do site */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">2. Objetivo do Site</h3>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-zinc-400 block">Qual o principal objetivo do site?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Apresentar a empresa",
                          "Atrair novos clientes",
                          "Passar mais credibilidade",
                          "Divulgar produtos/serviços",
                          "Facilitar contato pelo WhatsApp"
                        ].map((obj) => (
                          <label key={obj} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-850 bg-zinc-950/40 text-xs text-zinc-300 cursor-pointer hover:border-zinc-800 transition-colors">
                            <input
                              type="checkbox"
                              checked={(briefingForm.goals || []).includes(obj)}
                              onChange={() => toggleArrayField("goals", obj)}
                              className="accent-violet-500 h-4 w-4 rounded"
                            />
                            <span>{obj}</span>
                          </label>
                        ))}
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-zinc-400">Outro objetivo:</label>
                        <input
                          type="text"
                          value={briefingForm.goalsOther || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, goalsOther: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"O que vocês esperam que o site gere para a empresa?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.expectations || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, expectations: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Hoje vocês sentem falta de alguma coisa na presença digital?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.missingDigital || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, missingDigital: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Público-alvo */}
                {activeTab === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">3. Público-Alvo</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Quem vocês querem atingir?</label>
                        <input
                          type="text"
                          placeholder="Ex: Jovens de 18-25 anos, empresários, donas de casa..."
                          value={briefingForm.targetAudience || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, targetAudience: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Região de Atendimento</label>
                          <input
                            type="text"
                            placeholder="Ex: Local, regional, nacional..."
                            value={briefingForm.targetRegion || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, targetRegion: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Perfil dos Clientes</label>
                          <input
                            type="text"
                            placeholder="Ex: Classe A/B, B2B, tomadores de decisão..."
                            value={briefingForm.targetProfile || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, targetProfile: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Quem normalmente procura vocês?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.whoLooksFor || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, whoLooksFor: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Qual tipo de cliente vocês gostariam de conquistar mais?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.whoToConquer || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, whoToConquer: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Estrutura do site */}
                {activeTab === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">4. Estrutura do Site</h3>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-zinc-400 block">Páginas necessárias:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Página inicial",
                          "Sobre a empresa",
                          "Produtos/Serviços",
                          "Galeria de fotos",
                          "Depoimentos",
                          "Blog/notícias",
                          "Contato/WhatsApp",
                          "Localização/mapa"
                        ].map((page) => (
                          <label key={page} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-850 bg-zinc-950/40 text-xs text-zinc-300 cursor-pointer hover:border-zinc-800 transition-colors">
                            <input
                              type="checkbox"
                              checked={(briefingForm.pages || []).includes(page)}
                              onChange={() => toggleArrayField("pages", page)}
                              className="accent-violet-500 h-4 w-4 rounded"
                            />
                            <span>{page}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Quais informações vocês consideram essenciais para colocar no site?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.essentialInfo || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, essentialInfo: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Existe algum site que vocês gostam ou acham interessante?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.referencesSites || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, referencesSites: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Conteúdo disponível */}
                {activeTab === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">5. Conteúdo Disponível</h3>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-400 block">Materiais que o cliente já possui:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            "Logo",
                            "Fotos profissionais",
                            "Textos da empresa",
                            "Redes sociais",
                            "Vídeos"
                          ].map((mat) => (
                            <label key={mat} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-850 bg-zinc-950/40 text-xs text-zinc-300 cursor-pointer hover:border-zinc-800 transition-colors">
                              <input
                                type="checkbox"
                                checked={(briefingForm.materials || []).includes(mat)}
                                onChange={() => toggleArrayField("materials", mat)}
                                className="accent-violet-500 h-4 w-4 rounded"
                              />
                              <span>{mat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Precisa de ajuda para organizar os conteúdos?</span>
                        <input
                          type="checkbox"
                          checked={briefingForm.needHelpContent || false}
                          onChange={(e) => setBriefingForm({ ...briefingForm, needHelpContent: e.target.checked })}
                          className="accent-violet-500 h-5 w-5 rounded cursor-pointer"
                        />
                      </div>

                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                        <label className="text-xs font-medium text-zinc-300 italic">"Vocês já possuem fotos e materiais da empresa?"</label>
                        <textarea
                          rows={3}
                          value={briefingForm.materialsStatus || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, materialsStatus: e.target.value })}
                          className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: Identidade visual */}
                {activeTab === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">6. Identidade Visual</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Cores da Marca</label>
                        <input
                          type="text"
                          placeholder="Ex: Azul escuro e dourado, preto e branco..."
                          value={briefingForm.brandColors || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, brandColors: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 block">Estilo visual desejado:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {["Moderno", "Elegante", "Minimalista", "Tradicional", "Criativo"].map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setBriefingForm({ ...briefingForm, visualStyle: style })}
                              className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                briefingForm.visualStyle === style
                                  ? "bg-violet-950/40 text-violet-400 border-violet-500/30"
                                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Existe alguma cor ou estilo que representa a empresa?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.colorsRepresentation || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, colorsRepresentation: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Tem alguma referência visual que vocês gostam?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.visualReferences || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, visualReferences: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 7: Funcionalidades */}
                {activeTab === 7 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">7. Funcionalidades</h3>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-zinc-400 block">Funcionalidades:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Botão WhatsApp",
                          "Formulário de contato",
                          "Catálogo de produtos",
                          "Integração Instagram",
                          "Google Maps",
                          "Área de clientes",
                          "Sistema personalizado"
                        ].map((feat) => (
                          <label key={feat} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-850 bg-zinc-950/40 text-xs text-zinc-300 cursor-pointer hover:border-zinc-800 transition-colors">
                            <input
                              type="checkbox"
                              checked={(briefingForm.features || []).includes(feat)}
                              onChange={() => toggleArrayField("features", feat)}
                              className="accent-violet-500 h-4 w-4 rounded"
                            />
                            <span>{feat}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"Existe alguma função específica que vocês imaginam no site?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.featuresSpecific || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, featuresSpecific: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                          <label className="text-xs font-medium text-zinc-300 italic">"O cliente precisa apenas visualizar ou realizar alguma ação?"</label>
                          <textarea
                            rows={3}
                            value={briefingForm.clientAction || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, clientAction: e.target.value })}
                            className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 8: Hospedagem e domínio */}
                {activeTab === 8 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">8. Hospedagem & Domínio</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Já possui domínio?</label>
                          <input
                            type="text"
                            placeholder="Ex: Sim (exemplo.com.br), Não..."
                            value={briefingForm.hasDomain || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, hasDomain: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Já possui hospedagem?</label>
                          <input
                            type="text"
                            placeholder="Ex: Sim (Hostgator), Não..."
                            value={briefingForm.hasHosting || ""}
                            onChange={(e) => setBriefingForm({ ...briefingForm, hasHosting: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 block">Deseja contratar por conta própria ou deixar conosco?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {["Contratar por conta própria", "Deixar com o Freelancer"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setBriefingForm({ ...briefingForm, domainHostingOption: option })}
                              className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                briefingForm.domainHostingOption === option
                                  ? "bg-violet-950/40 text-violet-400 border-violet-500/30"
                                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">Explicação técnica sugerida</span>
                        <p className="text-xs text-zinc-400 leading-relaxed italic">
                          "Podemos deixar tudo registrado no nome da empresa, garantindo que vocês tenham total controle. Também podemos cuidar da parte técnica para facilitar."
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Observações adicionais de Hospedagem</label>
                        <textarea
                          rows={2}
                          value={briefingForm.domainHostingNotes || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, domainHostingNotes: e.target.value })}
                          className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 9: Prazo */}
                {activeTab === 9 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">9. Prazo</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Existe uma data desejada para lançamento?</label>
                        <input
                          type="text"
                          placeholder="Ex: Final do próximo mês, antes do natal..."
                          value={briefingForm.desiredDate || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, desiredDate: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                        <label className="text-xs font-medium text-zinc-300 italic">"Existe algum evento, campanha ou momento específico que vocês querem aproveitar?"</label>
                        <textarea
                          rows={3}
                          value={briefingForm.launchEvents || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, launchEvents: e.target.value })}
                          className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 10: Investimento */}
                {activeTab === 10 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">10. Investimento e Proposta</h3>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-zinc-400 block">Itens da proposta comercial a serem apresentados:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Desenvolvimento do site",
                          "Registro do domínio",
                          "Hospedagem",
                          "Manutenção (opcional)",
                          "Atualizações futuras"
                        ].map((item) => (
                          <label key={item} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-850 bg-zinc-950/40 text-xs text-zinc-300 cursor-pointer hover:border-zinc-800 transition-colors">
                            <input
                              type="checkbox"
                              checked={(briefingForm.proposalItems || []).includes(item)}
                              onChange={() => toggleArrayField("proposalItems", item)}
                              className="accent-violet-500 h-4 w-4 rounded"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 block">Pergunta para Reunião</span>
                        <label className="text-xs font-medium text-zinc-300 italic">"Dentro do que conversamos, faz sentido para vocês ter essa solução?"</label>
                        <textarea
                          rows={3}
                          value={briefingForm.investmentNotes || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, investmentNotes: e.target.value })}
                          className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 11: Próximos passos */}
                {activeTab === 11 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">11. Próximos Passos</h3>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-zinc-400 block">Fluxo de próximas etapas:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Enviar proposta",
                          "Receber materiais",
                          "Aprovar layout",
                          "Iniciar desenvolvimento",
                          "Entregar site"
                        ].map((step) => (
                          <label key={step} className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-850 bg-zinc-950/40 text-xs text-zinc-300 cursor-pointer hover:border-zinc-800 transition-colors">
                            <input
                              type="checkbox"
                              checked={(briefingForm.nextSteps || []).includes(step)}
                              onChange={() => toggleArrayField("nextSteps", step)}
                              className="accent-violet-500 h-4 w-4 rounded"
                            />
                            <span>{step}</span>
                          </label>
                        ))}
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-zinc-400">Notas finais de acompanhamento</label>
                        <textarea
                          rows={4}
                          value={briefingForm.nextStepsNotes || ""}
                          onChange={(e) => setBriefingForm({ ...briefingForm, nextStepsNotes: e.target.value })}
                          className="w-full p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white outline-none focus:border-violet-500"
                          placeholder="Anotações gerais, datas de reuniões de retorno, acordos informais..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-850 flex items-center justify-between shrink-0 bg-zinc-950/35">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={activeTab === 1}
                  onClick={() => setActiveTab(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all border border-zinc-800 flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={activeTab === 11}
                  onClick={() => setActiveTab(prev => Math.min(11, prev + 1))}
                  className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all border border-zinc-800 flex items-center gap-1"
                >
                  Próximo
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBriefingOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-850 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBriefing}
                  disabled={isSavingBriefing}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white text-xs font-bold shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center gap-1.5"
                >
                  {isSavingBriefing ? "Salvando..." : "Salvar Briefing"}
                </button>
              </div>
            </div>
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
