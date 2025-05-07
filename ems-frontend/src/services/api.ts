import axios from "axios";
import {
  Employee,
  EmployeeCreateUpdateDTO,
  AuthResponse,
  Department,
  Designation,
  Leave,
  LeaveType,
  LeaveStatus,
  LeaveBalance,
  DashboardStats,
} from "../types";

const API_URL = "https://localhost:7004/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Request interceptor - Token:", token);
  console.log("Request interceptor - Config:", {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle authorization errors
api.interceptors.response.use(
  (response) => {
    console.log("Response interceptor - Success:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error("Response interceptor - Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  console.log("Raw API response:", response.data);
  return response.data;
};

export const updateUserPassword = async (
  userId: number,
  passwordData: {
    currentPassword: string;
    newPassword: string;
  }
): Promise<void> => {
  await api.put('/User/update-password', {
    userId,
    oldPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword
  });
};

// Employee endpoints
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>("/Employee");
  return response.data;
};

export const getEmployee = async (id: number): Promise<Employee> => {
  const response = await api.get<Employee>(`/Employee/${id}`);
  return response.data;
};

export const createEmployee = async (
  employeeData: EmployeeCreateUpdateDTO
): Promise<Employee> => {
  // Log the request data for debugging
  console.log("Creating employee with data:", employeeData);
  const response = await api.post<Employee>("/Employee", employeeData);
  return response.data;
};

export const updateEmployee = async (
  id: number,
  employeeData: EmployeeCreateUpdateDTO
): Promise<Employee> => {
  const response = await api.put<Employee>(`/Employee/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await api.delete(`/Employee/${id}`);
};

// Department endpoints
export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get<Department[]>("/Department");
  return response.data;
};

export const createDepartment = async (department: {
  name: string;
}): Promise<Department> => {
  const response = await api.post<Department>("/Department", department);
  return response.data;
};

export const updateDepartment = async (
  id: number,
  department: { name: string; id?: number }
): Promise<Department> => {
  const response = await api.put<Department>(`/Department/${id}`, {
    ...department,
    id,
  });
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`/Department/${id}`);
};

// Designation endpoints
export const getDesignations = async (): Promise<Designation[]> => {
  const response = await api.get<Designation[]>("/Designation");
  return response.data;
};

export const createDesignation = async (designation: {
  title: string;
}): Promise<Designation> => {
  const response = await api.post<Designation>("/Designation", designation);
  return response.data;
};

export const updateDesignation = async (
  id: number,
  designation: { title: string }
): Promise<Designation> => {
  const response = await api.put<Designation>(
    `/Designation/${id}`,
    designation
  );
  return response.data;
};

export const deleteDesignation = async (id: number): Promise<void> => {
  await api.delete(`/Designation/${id}`);
};

// Leave endpoints
export const getLeaves = async (): Promise<Leave[]> => {
  const response = await api.get<Leave[]>("/Leave");
  return response.data;
};

export const getEmployeeLeaves = async (
  employeeId: number
): Promise<Leave[]> => {
  console.log('Making API call to getEmployeeLeaves with employeeId:', employeeId);
  console.log('Full URL:', `${API_URL}/Leave/Employee/${employeeId}`);
  try {
    const response = await api.get<Leave[]>(`/Leave/Employee/${employeeId}`);
    console.log('getEmployeeLeaves API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getEmployeeLeaves:', error);
    throw error;
  }
};

export const createLeave = async (leave: any): Promise<Leave> => {
  console.log("Creating leave with data:", leave);
  try {
    const response = await api.post<Leave>("/Leave/apply", leave);
    console.log("Leave creation successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Leave creation failed:", error);
    throw error;
  }
};

export const approveLeave = async (id: number): Promise<string> => {
  const response = await api.put<string>(`/Leave/approve/${id}`);
  return response.data;
};

export const rejectLeave = async (id: number): Promise<string> => {
  const response = await api.put<string>(`/Leave/reject/${id}`);
  return response.data;
};

export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  const response = await api.get<LeaveType[]>("/LeaveType");
  return response.data;
};

export const getLeaveStatuses = async (): Promise<LeaveStatus[]> => {
  const response = await api.get<LeaveStatus[]>("/LeaveStatus");
  return response.data;
};

export const getLeavesForManager = async (
  managerId: number
): Promise<Leave[]> => {
  // Get all leaves and filter for those where the managerId matches
  const leavesResponse = await api.get<Leave[]>("/Leave");
  return leavesResponse.data.filter((leave) => leave.managerId === managerId);
};

// Leave Balance endpoints
export const getEmployeeLeaveBalance = async (
  employeeId: number
): Promise<LeaveBalance[]> => {
  const response = await api.get<LeaveBalance[]>(`/LeaveBalance/employee/${employeeId}`);
  return response.data;
};

export const getLeaveBalanceByType = async (
  employeeId: number,
  leaveTypeId: number
): Promise<LeaveBalance> => {
  const response = await api.get<LeaveBalance>(`/LeaveBalance/employee/${employeeId}/type/${leaveTypeId}`);
  return response.data;
};

export const updateLeaveBalance = async (
  employeeId: number,
  leaveTypeId: number,
  totalDays: number
): Promise<LeaveBalance> => {
  const response = await api.put<LeaveBalance>(`/LeaveBalance/employee/${employeeId}/type/${leaveTypeId}`, {
    totalDays
  });
  return response.data;
};

// Dashboard endpoints
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};