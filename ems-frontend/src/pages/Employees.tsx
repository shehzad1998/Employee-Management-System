import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Lock as LockIcon } from '@mui/icons-material';
import { useEmployeeStore } from '../stores/employeeStore';
import { Employee, EmployeeCreateUpdateDTO, Department, Designation } from '../types';
import * as api from '../services/api';

const Employees: React.FC = () => {
  const { employees, loading, error, fetchEmployees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [user, setUser] = useState<any>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<EmployeeCreateUpdateDTO>({
    name: '',
    phone: '',
    departmentId: 0,
    designationId: 0,
    managerId: 0,
    user: {
      username: '',
      email: '',
      password: '',
      roleId: 2,
    }
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    fetchEmployees();
    api.getDepartments().then(setDepartments);
    api.getDesignations().then(setDesignations);
    api.getRoles().then(setRoles);
  }, []);

  useEffect(() => {
    if (employees.length > 0 && user) {
      if (user.roleName === 'Manager') {
        const managerEmployees = employees.filter(emp => emp.manager === user.id);
        setFilteredEmployees(managerEmployees);
      } else {
        setFilteredEmployees(employees);
      }
    }
  }, [employees, user]);

  const handleOpen = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        name: employee.name,
        phone: employee.phone,
        departmentId: employee.departmentId,
        designationId: employee.designationId,
        managerId: Number(employee.manager),
        user: {
          username: employee.username,
          email: employee.userEmail,
          password: '',
          roleId: 2,
        }
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        name: '',
        phone: '',
        departmentId: 0,
        designationId: 0,
        managerId: 0,
        user: {
          username: '',
          email: '',
          password: '',
          roleId: 2,
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, formData);
      } else {
        await addEmployee(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const handleOpenPasswordDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setSelectedEmployee(null);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await api.updateUserPassword(selectedEmployee?.userId || 0, {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      handleClosePasswordDialog();
      alert('Password updated successfully');
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('Failed to update password. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        {user?.roleName === 'Admin' && (
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Add Employee
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.departmentName}</TableCell>
                <TableCell>{employee.designationTitle}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.managerName}</TableCell>
                <TableCell>
                  {user?.roleName === 'Admin' && (
                    <>
                      <IconButton onClick={() => handleOpen(employee)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenPasswordDialog(employee)}>
                        <LockIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteEmployee(employee.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.departmentId}
                label="Department"
                onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Designation</InputLabel>
              <Select
                value={formData.designationId}
                label="Designation"
                onChange={(e) => setFormData({ ...formData, designationId: Number(e.target.value) })}
                required
              >
                {designations.map((des) => (
                  <MenuItem key={des.id} value={des.id}>{des.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Manager ID</InputLabel>
              <Select
                value={formData.managerId}
                label="Manager ID"
                onChange={(e) => setFormData({ ...formData, managerId: Number(e.target.value) })}
                required
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Username"
              fullWidth
              value={formData.user.username}
              onChange={(e) => setFormData({ 
                ...formData, 
                user: { ...formData.user, username: e.target.value }
              })}
              required
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={formData.user.email}
              onChange={(e) => setFormData({ 
                ...formData, 
                user: { ...formData.user, email: e.target.value }
              })}
              required
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={formData.user.password}
              onChange={(e) => setFormData({ 
                ...formData, 
                user: { ...formData.user, password: e.target.value }
              })}
              required={!selectedEmployee}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.user.roleId}
                label="Role"
                onChange={(e) => setFormData({ 
                  ...formData, 
                  user: { ...formData.user, roleId: Number(e.target.value) }
                })}
                required
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedEmployee ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Update Password</DialogTitle>
        <form onSubmit={handlePasswordUpdate}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              value={passwordFormData.currentPassword}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={passwordFormData.newPassword}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              value={passwordFormData.confirmPassword}
              onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Employees; 