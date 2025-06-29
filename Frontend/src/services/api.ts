import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// Get base URL from environment variable, fallback to localhost
const BASE_URL =
  import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors, but not for login/register requests
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthRequest = url.includes("/login") || url.includes("/register");

      if (!isAuthRequest) {
        // Only redirect for non-auth requests (like expired tokens)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Create a more descriptive error message
    let errorMessage = "Request failed";

    if (
      error.response?.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
    ) {
      errorMessage = error.response.data.message as string;
    } else if (error.response?.status) {
      errorMessage = `Request failed with status ${error.response.status}`;
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.message.includes("Network Error")
    ) {
      errorMessage = "Network error - unable to connect to server";
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;

    return Promise.reject(enhancedError);
  }
);

// Types for API responses
export interface Engineer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  seniority: string;
  jobType: string;
  capacity: {
    maxCapacity: number;
    totalAllocated: number;
    availableCapacity: number;
  };
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  managerId: string;
}

export interface Assignment {
  _id: string;
  engineerId: {
    _id: string;
    name: string;
  };
  projectId: {
    _id: string;
    name: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    requiredSkills?: string[];
  };
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  status: string;
  assignedBy?: {
    name: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "manager" | "engineer";
  skills?: string[];
  seniority?: string;
  jobType?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "manager" | "engineer";
  skills?: string[];
  seniority?: string;
  jobType?: string;
}

export interface AssignmentData {
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
}

export interface ProfileData {
  name: string;
  skills: string[];
  seniority: "junior" | "mid" | "senior";
  jobType: "full-time" | "part-time";
}

// Auth API functions
export const authAPI = {
  login: async (
    credentials: LoginCredentials
  ): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post("/api/auth/login", credentials);
    return response.data;
  },

  register: async (
    userData: RegisterData
  ): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post("/api/auth/register", userData);
    return response.data;
  },

  getEngineers: async (): Promise<Engineer[]> => {
    const response = await apiClient.get("/api/auth/engineers");
    return response.data;
  },

  updateProfile: async (profileData: ProfileData): Promise<{ user: User }> => {
    const response = await apiClient.put("/api/auth/profile", profileData);
    return response.data;
  },
};

// Projects API functions
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get("/api/projects");
    return response.data;
  },

  create: async (projectData: ProjectData): Promise<Project> => {
    const response = await apiClient.post("/api/projects", projectData);
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    projectData: Partial<ProjectData>
  ): Promise<Project> => {
    const response = await apiClient.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Project> => {
    const response = await apiClient.patch(`/api/projects/${id}/status`, {
      status,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },
};

// Assignments API functions
export const assignmentsAPI = {
  getAll: async (): Promise<Assignment[]> => {
    const response = await apiClient.get("/api/assignments");
    return response.data;
  },

  getMyAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get("/api/assignments/my-assignments");
    return response.data;
  },

  create: async (assignmentData: AssignmentData): Promise<Assignment> => {
    const response = await apiClient.post("/api/assignments", assignmentData);
    return response.data;
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await apiClient.get(`/api/assignments/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    assignmentData: Partial<AssignmentData>
  ): Promise<Assignment> => {
    const response = await apiClient.put(
      `/api/assignments/${id}`,
      assignmentData
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/assignments/${id}`);
  },
};

// Dashboard API functions
export const dashboardAPI = {
  getManagerDashboard: async (): Promise<{
    engineers: Engineer[];
    projects: Project[];
    assignments: Assignment[];
  }> => {
    const [engineersRes, projectsRes, assignmentsRes] = await Promise.all([
      apiClient.get("/api/auth/engineers"),
      apiClient.get("/api/projects"),
      apiClient.get("/api/assignments"),
    ]);

    return {
      engineers: engineersRes.data,
      projects: projectsRes.data,
      assignments: assignmentsRes.data,
    };
  },

  getEngineerDashboard: async (): Promise<Assignment[]> => {
    const response = await apiClient.get("/api/assignments/my-assignments");
    return response.data;
  },
};

export default apiClient;
