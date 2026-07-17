"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  type: string; // 'Landing Page' | 'Site' | 'E-commerce' | 'Web App' | 'Outro'
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
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => Project;
  updateProject: (id: string, project: Partial<Project>, logDetails?: string) => void;
  deleteProject: (id: string) => void;
  
  history: HistoryEntry[];
  addHistoryEntry: (projectId: string, action: string, details: string) => void;
  
  isLoading: boolean;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

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
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("crm_auth");
      setIsAuthenticated(auth === "true");

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
      
      setIsLoading(false);
    }
  }, []);

  // Save actions to localStorage
  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem("crm_clients", JSON.stringify(newClients));
  };

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem("crm_projects", JSON.stringify(newProjects));
  };

  const saveHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem("crm_history", JSON.stringify(newHistory));
  };

  // Auth Functions
  const login = (user: string, pass: string): boolean => {
    if (user === "admin" && pass === "admin") {
      setIsAuthenticated(true);
      localStorage.setItem("crm_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("crm_auth");
  };

  // Client Functions
  const addClient = (clientData: Omit<Client, "id" | "createdAt">): Client => {
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...clients, newClient];
    saveClients(updated);
    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    const updated = clients.map((client) =>
      client.id === id ? { ...client, ...updatedFields } : client
    );
    saveClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((client) => client.id !== id);
    saveClients(updated);
    
    // Optional: cascade delete projects or leave them unassigned
    const updatedProjects = projects.filter((project) => project.clientId !== id);
    saveProjects(updatedProjects);
  };

  // Project Functions
  const addProject = (projectData: Omit<Project, "id">): Project => {
    const newProject: Project = {
      ...projectData,
      id: `p-${Date.now()}`
    };
    const updated = [...projects, newProject];
    saveProjects(updated);

    // Add creation history
    addHistoryEntry(newProject.id, "Criação", `Projeto criado com status '${newProject.status}'.`);
    
    return newProject;
  };

  const updateProject = (id: string, updatedFields: Partial<Project>, logDetails?: string) => {
    const originalProject = projects.find((p) => p.id === id);
    if (!originalProject) return;

    const updated = projects.map((project) =>
      project.id === id ? { ...project, ...updatedFields } : project
    );
    saveProjects(updated);

    // Automatic logging for status changes if not manually specified
    if (updatedFields.status && updatedFields.status !== originalProject.status) {
      addHistoryEntry(
        id,
        "Alteração de Status",
        `Status alterado de '${originalProject.status}' para '${updatedFields.status}'.`
      );
    } else if (logDetails) {
      addHistoryEntry(id, "Edição", logDetails);
    }
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((project) => project.id !== id);
    saveProjects(updated);

    // Delete project logs too
    const updatedHistory = history.filter((h) => h.projectId !== id);
    saveHistory(updatedHistory);
  };

  // History Functions
  const addHistoryEntry = (projectId: string, action: string, details: string) => {
    const newEntry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...history];
    saveHistory(updated);
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
        isLoading
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
