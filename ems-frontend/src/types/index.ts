export interface Employee {
  id: number;
  name: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationTitle: string;
  userId: number;
  username: string;
  userEmail: string;
  manager: string;
  managerName?: string;
  role: string;
}

export interface UserCreateDTO {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export interface EmployeeCreateUpdateDTO {
  name: string;
  phone: string;
  departmentId: number;
  designationId: number;
  managerId: number;
  user: {
    username: string;
    email: string;
    password: string;
    roleId: number;
  }
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  employeeId: number;
  userId: number;
}

export interface Department {
  id: number;
  name: string;
}

export interface Designation {
  id: number;
  title: string;
}

export interface LeaveApplyDTO {
  employeeId: number;
  startDate: string;
  endDate: string;
  leaveMasterId: number;
}

export interface LeaveType {
  id: number;
  name: string;
}

export interface LeaveStatus {
  id: number;
  name: string; // e.g., "Pending", "Approved", "Rejected"
}

export interface Leave {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  type: string;
  status: string | number;
  statusText: string;
  reason: string;
  departmentName: string;
  designationTitle: string;
  managerId: number;
}

export interface LeaveCreateDTO {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalDesignations: number;
  recentLeaves: Leave[];
  departmentDistribution: {
    departmentName: string;
    employeeCount: number;
  }[];
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveMasterId: number;
  leaveType: string;
  maxDays: number;
  usedDays: number;
  remainingDays: number;
}
