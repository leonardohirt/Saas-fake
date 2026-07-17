"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

export interface Client {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: string;
  status: 'Novo' | 'Em andamento' | 'Revisão' | 'Concluído';
  value: number;
  startDate: string;
  deadline: string;
  description: string;
  githubLink?: string;
  websiteLink?: string;
}

export interface HistoryEntry {
  id: string;
  projectId: string;
  action: string;
  details: string;
  timestamp: string;
}

interface CRMContextType {
  isAuthenticated: boolean;
  currentUser: string | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => Promise<Project>;
  updateProject: (id: string, project: Partial<Project>, logDetails?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  history: HistoryEntry[];
  addHistoryEntry: (projectId: string, action: string, details: string) => Promise<void>;
  
  isLoading: boolean;
  isSupabaseActive: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Mappings between Database (snake_case) and JS/React (camelCase)
const mapClientToJS = (dbClient: any): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  company: dbClient.company,
  whatsapp: dbClient.whatsapp,
  email: dbClient.email,
  notes: dbClient.notes || "",
  createdAt: dbClient.created_at
});

const mapClientToDB = (client: Partial<Client>) => {
  const db: any = {};
  if (client.id !== undefined) db.id = client.id;
  if (client.name !== undefined) db.name = client.name;
  if (client.company !== undefined) db.company = client.company;
  if (client.whatsapp !== undefined) db.whatsapp = client.whatsapp;
  if (client.email !== undefined) db.email = client.email;
  if (client.notes !== undefined) db.notes = client.notes;
  if (client.createdAt !== undefined) db.created_at = client.createdAt;
  return db;
};

const mapProjectToJS = (dbProject: any): Project => ({
  id: dbProject.id,
  clientId: dbProject.client_id,
  name: dbProject.name,
  type: dbProject.type,
  status: dbProject.status,
  value: Number(dbProject.value),
  startDate: dbProject.start_date,
  deadline: dbProject.deadline,
  description: dbProject.description || "",
  githubLink: dbProject.github_link || "",
  websiteLink: dbProject.website_link || ""
});

const mapProjectToDB = (project: Partial<Project>) => {
  const db: any = {};
  if (project.id !== undefined) db.id = project.id;
  if (project.clientId !== undefined) db.client_id = project.clientId;
  if (project.name !== undefined) db.name = project.name;
  if (project.type !== undefined) db.type = project.type;
  if (project.status !== undefined) db.status = project.status;
  if (project.value !== undefined) db.value = project.value;
  if (project.startDate !== undefined) db.start_date = project.startDate;
  if (project.deadline !== undefined) db.deadline = project.deadline;
  if (project.description !== undefined) db.description = project.description;
  if (project.githubLink !== undefined) db.github_link = project.githubLink;
  if (project.websiteLink !== undefined) db.website_link = project.websiteLink;
  return db;
};

const mapHistoryToJS = (dbHistory: any): HistoryEntry => ({
  id: dbHistory.id,
  projectId: dbHistory.project_id,
  action: dbHistory.action,
  details: dbHistory.details,
  timestamp: dbHistory.timestamp
});

const mapHistoryToDB = (h: Partial<HistoryEntry>) => {
  const db: any = {};
  if (h.id !== undefined) db.id = h.id;
  if (h.projectId !== undefined) db.project_id = h.projectId;
  if (h.action !== undefined) db.action = h.action;
  if (h.details !== undefined) db.details = h.details;
  if (h.timestamp !== undefined) db.timestamp = h.timestamp;
  return db;
};

// Initial Mock data for LocalStorage Demo fallback
const initialClients: Client[] = [
  {
    id: "c-1",
    name: "Ana Souza",
    company: "Estúdio Shine",
    whatsapp: "11999998888",
    email: "contato@estudioshine.com.br",
    notes: "Parceiro recorrente para design de moda. Prefere comunicação direta via WhatsApp.",
    createdAt: "2026-06-10T10:00:00.000Z"
  },
  {
    id: "c-2",
    name: "Carlos Eduardo",
    company: "Pizzaria Bella Italia",
    whatsapp: "11988887777",
    email: "financeiro@bellaitalia.com",
    notes: "Cliente novo. Quer integrar sistema de pedidos online futuramente.",
    createdAt: "2026-07-01T14:30:00.000Z"
  },
  {
    id: "c-3",
    name: "Mariana Costa",
    company: "TechVanguard",
    whatsapp: "21977776666",
    email: "mariana.costa@techvanguard.dev",
    notes: "Startup de tecnologia. Alta exigência técnica e prazos enxutos.",
    createdAt: "2026-07-05T09:15:00.000Z"
  }
];

const initialProjects: Project[] = [
  {
    id: "p-1",
    clientId: "c-1",
    name: "Landing Page de Lançamento",
    type: "Landing Page",
    status: "Concluído",
    value: 2500,
    startDate: "2026-06-12",
    deadline: "2026-06-25",
    description: "Criação de landing page responsiva e otimizada para captação de leads da coleção de inverno.",
    githubLink: "https://github.com/freelancer/shine-winter",
    websiteLink: "https://shine-winter.vercel.app"
  },
  {
    id: "p-2",
    clientId: "c-2",
    name: "Site Institucional + Cardápio",
    type: "Site",
    status: "Em andamento",
    value: 4500,
    startDate: "2026-07-02",
    deadline: "2026-07-28",
    description: "Desenvolvimento do site institucional com cardápio dinâmico atualizável via Painel Admin.",
    githubLink: "https://github.com/freelancer/bella-italia-site",
    websiteLink: ""
  },
  {
    id: "p-3",
    clientId: "c-3",
    name: "Plataforma de SaaS Dashboard",
    type: "Web App",
    status: "Novo",
    value: 12000,
    startDate: "2026-07-10",
    deadline: "2026-08-30",
    description: "Desenvolvimento do MVP da plataforma SaaS contendo painel financeiro e gráficos em tempo real.",
    githubLink: "https://github.com/freelancer/techvanguard-saas",
    websiteLink: ""
  },
  {
    id: "p-4",
    clientId: "c-1",
    name: "Redesign do E-commerce",
    type: "E-commerce",
    status: "Revisão",
    value: 8000,
    startDate: "2026-06-20",
    deadline: "2026-07-20",
    description: "Novo layout focado em conversão e performance móvel para a loja Shopify.",
    githubLink: "https://github.com/freelancer/shine-ecommerce",
    websiteLink: "https://shine-shop.vercel.app"
  }
];

const initialHistory: HistoryEntry[] = [
  {
    id: "h-1",
    projectId: "p-1",
    action: "Criação",
    details: "Projeto criado com status 'Novo'.",
    timestamp: "2026-06-12T10:00:00.000Z"
  },
  {
    id: "h-2",
    projectId: "p-1",
    action: "Alteração de Status",
    details: "Status alterado de 'Novo' para 'Em andamento'.",
    timestamp: "2026-06-14T11:20:00.000Z"
  },
  {
    id: "h-3",
    projectId: "p-1",
    action: "Alteração de Status",
    details: "Status alterado de 'Em andamento' para 'Revisão'.",
    timestamp: "2026-06-23T16:45:00.000Z"
  },
  {
    id: "h-4",
    projectId: "p-1",
    action: "Alteração de Status",
    details: "Status alterado de 'Revisão' para 'Concluído'.",
    timestamp: "2026-06-25T14:10:00.000Z"
  },
  {
    id: "h-5",
    projectId: "p-2",
    action: "Criação",
    details: "Projeto criado com status 'Novo'.",
    timestamp: "2026-07-02T14:35:00.000Z"
  },
  {
    id: "h-6",
    projectId: "p-2",
    action: "Alteração de Status",
    details: "Status alterado de 'Novo' para 'Em andamento'.",
    timestamp: "2026-07-05T09:00:00.000Z"
  }
];

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from Supabase (or fallback to LocalStorage)
  useEffect(() => {
    const initData = async () => {
      if (typeof window === "undefined") return;

      // Load session
      const auth = localStorage.getItem("crm_auth");
      setIsAuthenticated(auth === "true");
      const savedUser = localStorage.getItem("crm_user");
      setCurrentUser(savedUser);

      if (isSupabaseReady && supabase) {
        try {
          // Fetch Clients
          const { data: dbClients, error: clientsErr } = await supabase
            .from("clients")
            .select("*")
            .order("name", { ascending: true });

          if (clientsErr) throw clientsErr;

          // Fetch Projects
          const { data: dbProjects, error: projectsErr } = await supabase
            .from("projects")
            .select("*");

          if (projectsErr) throw projectsErr;

          // Fetch History
          const { data: dbHistory, error: historyErr } = await supabase
            .from("history")
            .select("*")
            .order("timestamp", { ascending: false });

          if (historyErr) throw historyErr;

          setClients((dbClients || []).map(mapClientToJS));
          setProjects((dbProjects || []).map(mapProjectToJS));
          setHistory((dbHistory || []).map(mapHistoryToJS));
        } catch (err) {
          console.error("Erro ao conectar com o Supabase, carregando localmente:", err);
          loadLocalStorageFallback();
        }
      } else {
        loadLocalStorageFallback();
      }
      setIsLoading(false);
    };

    const loadLocalStorageFallback = () => {
      const localClients = localStorage.getItem("crm_clients");
      if (localClients) {
        setClients(JSON.parse(localClients));
      } else {
        setClients(initialClients);
        localStorage.setItem("crm_clients", JSON.stringify(initialClients));
      }

      const localProjects = localStorage.getItem("crm_projects");
      if (localProjects) {
        setProjects(JSON.parse(localProjects));
      } else {
        setProjects(initialProjects);
        localStorage.setItem("crm_projects", JSON.stringify(initialProjects));
      }

      const localHistory = localStorage.getItem("crm_history");
      if (localHistory) {
        setHistory(JSON.parse(localHistory));
      } else {
        setHistory(initialHistory);
        localStorage.setItem("crm_history", JSON.stringify(initialHistory));
      }
    };

    initData();
  }, []);

  // LocalStorage state persistence helpers (for fallback mode)
  const saveClientsLocally = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem("crm_clients", JSON.stringify(newClients));
  };

  const saveProjectsLocally = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem("crm_projects", JSON.stringify(newProjects));
  };

  const saveHistoryLocally = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem("crm_history", JSON.stringify(newHistory));
  };

  // Auth Functions
  const login = async (user: string, pass: string): Promise<boolean> => {
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("username")
          .eq("username", user)
          .eq("password", pass)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsAuthenticated(true);
          setCurrentUser(data.username);
          localStorage.setItem("crm_auth", "true");
          localStorage.setItem("crm_user", data.username);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Erro no login do Supabase:", err);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("crm_auth");
    localStorage.removeItem("crm_user");
  };

  // Client Functions
  const addClient = async (clientData: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseReady && supabase) {
      try {
        const { error } = await supabase
          .from("clients")
          .insert(mapClientToDB(newClient));
        if (error) throw error;
        setClients(prev => [...prev, newClient]);
      } catch (err) {
        console.error("Erro no Supabase, adicionando localmente:", err);
        saveClientsLocally([...clients, newClient]);
      }
    } else {
      saveClientsLocally([...clients, newClient]);
    }
    return newClient;
  };

  const updateClient = async (id: string, updatedFields: Partial<Client>): Promise<void> => {
    const updated = clients.map((client) =>
      client.id === id ? { ...client, ...updatedFields } : client
    );

    if (isSupabaseReady && supabase) {
      try {
        const { error } = await supabase
          .from("clients")
          .update(mapClientToDB(updatedFields))
          .eq("id", id);
        if (error) throw error;
        setClients(updated);
      } catch (err) {
        console.error("Erro no Supabase, editando localmente:", err);
        saveClientsLocally(updated);
      }
    } else {
      saveClientsLocally(updated);
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    const updated = clients.filter((client) => client.id !== id);
    const updatedProjects = projects.filter((project) => project.clientId !== id);

    if (isSupabaseReady && supabase) {
      try {
        // Cascade delete will occur in PostgreSQL, but we call delete explicitly
        const { error } = await supabase.from("clients").delete().eq("id", id);
        if (error) throw error;
        setClients(updated);
        setProjects(updatedProjects);
      } catch (err) {
        console.error("Erro no Supabase, excluindo localmente:", err);
        saveClientsLocally(updated);
        saveProjectsLocally(updatedProjects);
      }
    } else {
      saveClientsLocally(updated);
      saveProjectsLocally(updatedProjects);
    }
  };

  // Project Functions
  const addProject = async (projectData: Omit<Project, "id">): Promise<Project> => {
    const newProject: Project = {
      ...projectData,
      id: `p-${Date.now()}`
    };

    if (isSupabaseReady && supabase) {
      try {
        const { error } = await supabase
          .from("projects")
          .insert(mapProjectToDB(newProject));
        if (error) throw error;
        setProjects(prev => [...prev, newProject]);
        
        // Add creation history
        await addHistoryEntry(newProject.id, "Criação", `Projeto criado com status '${newProject.status}'.`);
      } catch (err) {
        console.error("Erro no Supabase, adicionando localmente:", err);
        saveProjectsLocally([...projects, newProject]);
        addHistoryEntryLocally(newProject.id, "Criação", `Projeto criado com status '${newProject.status}'.`);
      }
    } else {
      saveProjectsLocally([...projects, newProject]);
      addHistoryEntryLocally(newProject.id, "Criação", `Projeto criado com status '${newProject.status}'.`);
    }
    
    return newProject;
  };

  const updateProject = async (id: string, updatedFields: Partial<Project>, logDetails?: string): Promise<void> => {
    const originalProject = projects.find((p) => p.id === id);
    if (!originalProject) return;

    const updated = projects.map((project) =>
      project.id === id ? { ...project, ...updatedFields } : project
    );

    if (isSupabaseReady && supabase) {
      try {
        const { error } = await supabase
          .from("projects")
          .update(mapProjectToDB(updatedFields))
          .eq("id", id);
        if (error) throw error;
        setProjects(updated);

        // Automatic logging
        if (updatedFields.status && updatedFields.status !== originalProject.status) {
          await addHistoryEntry(
            id,
            "Alteração de Status",
            `Status alterado de '${originalProject.status}' para '${updatedFields.status}'.`
          );
        } else if (logDetails) {
          await addHistoryEntry(id, "Edição", logDetails);
        }
      } catch (err) {
        console.error("Erro no Supabase, editando localmente:", err);
        saveProjectsLocally(updated);
        
        if (updatedFields.status && updatedFields.status !== originalProject.status) {
          addHistoryEntryLocally(
            id,
            "Alteração de Status",
            `Status alterado de '${originalProject.status}' para '${updatedFields.status}'.`
          );
        } else if (logDetails) {
          addHistoryEntryLocally(id, "Edição", logDetails);
        }
      }
    } else {
      saveProjectsLocally(updated);
      
      if (updatedFields.status && updatedFields.status !== originalProject.status) {
        addHistoryEntryLocally(
          id,
          "Alteração de Status",
          `Status alterado de '${originalProject.status}' para '${updatedFields.status}'.`
        );
      } else if (logDetails) {
        addHistoryEntryLocally(id, "Edição", logDetails);
      }
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    const updated = projects.filter((project) => project.id !== id);
    const updatedHistory = history.filter((h) => h.projectId !== id);

    if (isSupabaseReady && supabase) {
      try {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
        setProjects(updated);
        setHistory(updatedHistory);
      } catch (err) {
        console.error("Erro no Supabase, deletando localmente:", err);
        saveProjectsLocally(updated);
        saveHistoryLocally(updatedHistory);
      }
    } else {
      saveProjectsLocally(updated);
      saveHistoryLocally(updatedHistory);
    }
  };

  // History Functions
  const addHistoryEntry = async (projectId: string, action: string, details: string): Promise<void> => {
    const newEntry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    if (isSupabaseReady && supabase) {
      try {
        const { error } = await supabase
          .from("history")
          .insert(mapHistoryToDB(newEntry));
        if (error) throw error;
        setHistory(prev => [newEntry, ...prev]);
      } catch (err) {
        console.error("Erro no Supabase, salvando histórico localmente:", err);
        addHistoryEntryLocally(projectId, action, details);
      }
    } else {
      addHistoryEntryLocally(projectId, action, details);
    }
  };

  const addHistoryEntryLocally = (projectId: string, action: string, details: string) => {
    const newEntry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...history];
    saveHistoryLocally(updated);
  };

  return (
    <CRMContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        clients,
        addClient,
        updateClient,
        deleteClient,
        projects,
        addProject,
        updateProject,
        deleteProject,
        history,
        addHistoryEntry,
        isLoading,
        isSupabaseActive: isSupabaseReady,
        currentUser
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
