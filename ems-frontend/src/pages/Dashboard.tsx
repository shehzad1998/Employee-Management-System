import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useEmployeeStore } from '../stores/employeeStore';
import { Employee, Leave, Department, Designation, ApiResponse } from '../types';
import * as api from '../services/api';

interface User {
  id: number;
  roleId: number;
  employeeId?: number;
  name: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const { employees, fetchEmployees } = useEmployeeStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myLeaves, setMyLeaves] = useState<Leave[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<Leave[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const userData = JSON.parse(userStr);
      setUser(userData);

      // Only fetch employees if user is Admin or Manager
      if (userData.roleId === 1 || userData.roleId === 2) {
        await fetchEmployees();
      }

      // Fetch departments and designations only if needed
      if (userData.roleId === 1) { // Admin
        const departmentsRes = await api.getDepartments();
        const designationsRes = await api.getDesignations();

        setDepartments(departmentsRes);
        setDesignations(designationsRes);
      }

      // Fetch leaves based on user role
      if (userData.roleId === 1 || userData.roleId === 2) {
        // For admins and managers, fetch all leaves
        const leavesRes = await api.getLeaves();
        setRecentLeaves(leavesRes);
      } else if (userData.roleId === 3 && userData.employeeId) {
        // For employees, fetch their own leaves
        const myLeavesRes = await api.getEmployeeLeaves(userData.employeeId);
        setMyLeaves(myLeavesRes);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) {
      setFilteredEmployees(employees);
      return;
    }
    if (user.roleId === 2) {
      const managerKey = user.employeeId || user.id;
      setFilteredEmployees(employees.filter(emp => emp.manager === managerKey));
    } else {
      setFilteredEmployees(employees);
    }
  }, [employees, user]);

  useEffect(() => {
    if (user && user.roleId === 2 && employees.length > 0) {
      console.log('Manager employeeId:', user.employeeId);
      console.log('All employees:', employees.map(e => ({ id: e.id, manager: e.manager })));
      const filtered = employees.filter(emp => emp.manager === user.employeeId);
      console.log('Filtered team members:', filtered);
      setTeamMembers(filtered);
    } else {
      setTeamMembers([]);
    }
  }, [employees, user]);

  // Get role name based on roleId
  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'Admin';
      case 2:
        return 'Manager';
      case 3:
        return 'Employee';
      default:
        return 'Unknown';
    }
  };

  const loadDashboardData = async () => {
    try {
      // For employees, we don't need to fetch all employees
      if (user?.roleId !== 3) { // Not an employee
        await fetchEmployees();
      }

      if (user?.roleId === 1) { // Admin only
        const departmentsRes = await api.getDepartments();
        const designationsRes = await api.getDesignations();

        setDepartments(departmentsRes);
        setDesignations(designationsRes);
      }

      // Fetch leaves based on user role
      if (user?.roleId === 1 || user?.roleId === 2) {
        // For admins and managers, fetch all leaves
        const leavesRes = await api.getLeaves();
        setRecentLeaves(leavesRes);
      } else if (user?.roleId === 3) {
        // For employees, fetch their own leaves
        const myLeavesRes = await api.getEmployeeLeaves(user.employeeId);
        setMyLeaves(myLeavesRes);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  // Helper to get department and designation from employees if missing
  const getDeptAndDesig = (leave: Leave) => {
    let departmentName = leave.departmentName;
    let designationTitle = leave.designationTitle;
    if ((!departmentName || !designationTitle) && employees && employees.length > 0) {
      const emp = employees.find(e => e.id === leave.employeeId);
      if (emp) {
        departmentName = emp.departmentName;
        designationTitle = emp.designationTitle;
      }
    }
    return { departmentName, designationTitle };
  };

  // Robust pending leaves count
  const getPendingLeavesCount = (leaves: Leave[]) =>
    leaves.filter(
      leave =>
        leave.status === 'Pending' ||
        leave.statusText === 'Pending' ||
        leave.status === 0
    ).length;

  // Team member count for manager
  const teamMemberCount = user && user.roleId === 2
    ? employees.filter(emp => String(emp.manager) === String(user.employeeId)).length
    : 0;

  // Pending leaves for manager's team
  let pendingTeamLeavesCount = 0;
  if (user && user.roleId === 2) {
    const teamMemberIds = employees
      .filter(emp => String(emp.manager) === String(user.employeeId))
      .map(emp => emp.id);
    pendingTeamLeavesCount = recentLeaves.filter(
      leave =>
        teamMemberIds.includes(leave.employeeId) &&
        (leave.status === 'Pending' || leave.statusText === 'Pending' || leave.status === 0)
    ).length;
  }

  const AdminDashboard = () => (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Total Employees</Typography>
                  <Typography variant="h4">{employees.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Departments</Typography>
                  <Typography variant="h4">{departments.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Designations</Typography>
                  <Typography variant="h4">{designations.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventNoteIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Pending Leaves</Typography>
                  <Typography variant="h4">{getPendingLeavesCount(recentLeaves)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 300 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Leave Requests</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentLeaves.map((leave: Leave) => {
                    const { departmentName, designationTitle } = getDeptAndDesig(leave);
                    return (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.employeeName}</TableCell>
                        <TableCell>{departmentName}</TableCell>
                        <TableCell>{designationTitle}</TableCell>
                        <TableCell>{leave.leaveType || leave.type}</TableCell>
                        <TableCell>
                          {new Date(leave.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(leave.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{leave.statusText}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 300 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Department Distribution</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Employees</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell align="right">
                        {employees.filter(emp => emp.departmentId === dept.id).length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </>
  );

  const ManagerDashboard = () => {
    return (
      <>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33% - 16px)' }, minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Team Members</Typography>
                    <Typography variant="h4">{teamMemberCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33% - 16px)' }, minWidth: 200 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Pending Leaves</Typography>
                    <Typography variant="h4">{pendingTeamLeavesCount}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 300 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Team Leave Requests</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Designation</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentLeaves.map((leave: Leave) => {
                      const { departmentName, designationTitle } = getDeptAndDesig(leave);
                      return (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.employeeName}</TableCell>
                          <TableCell>{departmentName}</TableCell>
                          <TableCell>{designationTitle}</TableCell>
                          <TableCell>{leave.leaveType || leave.type}</TableCell>
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{leave.statusText}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </>
    );
  };

  const EmployeeDashboard = () => (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33% - 16px)' }, minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventNoteIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">My Leaves</Typography>
                  <Typography variant="h4">{myLeaves.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 300 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>My Leave Requests</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : myLeaves.length === 0 ? (
              <Typography sx={{ p: 2, textAlign: 'center' }}>No leave requests found</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myLeaves.map((leave: Leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.leaveType || leave.type}</TableCell>
                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{leave.statusText}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await api.updateUserPassword(user?.id || 0, {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      handleClosePasswordDialog();
      alert('Password updated successfully');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to update password. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      {/* User Profile Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography color="textSecondary">{user?.email}</Typography>
              <Typography color="textSecondary">Role: {getRoleName(user?.roleId || 0)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {user?.roleId === 1 && <AdminDashboard />}
      {user?.roleId === 2 && <ManagerDashboard />}
      {user?.roleId === 3 && <EmployeeDashboard />}
    </Box>
  );
};

export default Dashboard; 