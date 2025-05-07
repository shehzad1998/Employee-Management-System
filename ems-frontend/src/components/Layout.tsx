import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  EventNote as EventNoteIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import * as api from '../services/api';
import { Employee } from '../types';
import EditUserDialog from './EditUserDialog';

const drawerWidth = 280; // Increased drawer width for better spacing

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const [userEmployee, setUserEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('User data from localStorage:', userData);
        setUser(userData);
        
        // Fetch the employee details for the logged-in user
        if (userData.employeeId) {
          api.getEmployee(userData.employeeId)
            .then(employee => {
              console.log('Employee data:', employee);
              setUserEmployee(employee);
            })
            .catch(error => {
              console.error('Error fetching user employee details:', error);
            });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  ];

  // Only show Employees tab for Admin
  if (user?.roleId === 1) {
    menuItems.push(
      { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
      { text: 'Departments', icon: <BusinessIcon />, path: '/departments' },
      { text: 'Designations', icon: <WorkIcon />, path: '/designations' },
      { text: 'Leave Balance Management', icon: <EventNoteIcon />, path: '/leave-balance' }
    );
  }

  // Add Leaves menu item for all users
  menuItems.push({ text: 'My Leaves', icon: <EventNoteIcon />, path: '/leaves' });

  // Add Leave Management menu item for admins and managers
  if (user?.roleId === 1 || user?.roleId === 2) {
    menuItems.push({ 
      text: user?.roleId === 1 ? 'Manage All Leaves' : 'Employee Leaves', 
      icon: <AssignmentIcon />, 
      path: '/manager-leaves' 
    });
  }

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
  };

  const handleUserUpdate = () => {
    // Refresh user data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        if (userData.employeeId) {
          api.getEmployee(userData.employeeId)
            .then(employee => {
              setUserEmployee(employee);
            })
            .catch(error => {
              console.error('Error fetching user employee details:', error);
            });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#ffffff' }}>
      {user && (
        <Box sx={{ 
          p: 3,
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          position: 'relative'
        }}>
          <IconButton
            onClick={handleEditClick}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'primary.main'
            }}
          >
            <EditIcon />
          </IconButton>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2 
          }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#1976d2',
                fontSize: '2rem',
                mb: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {user.username ? user.username.charAt(0).toUpperCase() : <PersonIcon />}
            </Avatar>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 500,
                color: '#2c3e50',
                mb: 0.5
              }}
            >
              {user.username}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#7f8c8d',
              mb: 1
            }}>
              <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2">
                {user.email}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#1976d2',
                fontWeight: 500,
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                px: 2,
                py: 0.5,
                borderRadius: 1
              }}
            >
              {getRoleName(user.roleId)}
            </Typography>
          </Box>
        </Box>
      )}

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#1976d2', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#2c3e50'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <EditUserDialog
        open={isEditDialogOpen}
        onClose={handleEditClose}
        user={user}
        userEmployee={userEmployee}
        onUserUpdate={handleUserUpdate}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1976d2',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Employee Management System
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              bgcolor: '#ffffff'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 