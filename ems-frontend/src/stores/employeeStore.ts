import { create } from 'zustand';
import { Employee, EmployeeCreateUpdateDTO } from '../types';
import * as api from '../services/api';

interface EmployeeStore {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  addEmployee: (employee: EmployeeCreateUpdateDTO) => Promise<void>;
  updateEmployee: (id: number, employee: EmployeeCreateUpdateDTO) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const employees = await api.getEmployees();
      set({ employees, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch employees', loading: false });
    }
  },

  addEmployee: async (employee) => {
    set({ loading: true, error: null });
    try {
      await api.createEmployee(employee);
      const employees = await api.getEmployees();
      set({ employees, loading: false });
    } catch (error) {
      set({ error: 'Failed to add employee', loading: false });
    }
  },

  updateEmployee: async (id, employee) => {
    set({ loading: true, error: null });
    try {
      await api.updateEmployee(id, employee);
      const employees = await api.getEmployees();
      set({ employees, loading: false });
    } catch (error) {
      set({ error: 'Failed to update employee', loading: false });
    }
  },

  deleteEmployee: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteEmployee(id);
      const employees = await api.getEmployees();
      set({ employees, loading: false });
    } catch (error) {
      set({ error: 'Failed to delete employee', loading: false });
    }
  },
})); 