import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Designations from './pages/Designations';
import Leaves from './pages/Leaves';
import ManagerLeaves from './pages/ManagerLeaves';
import LeaveBalanceManagement from './pages/LeaveBalanceManagement';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="designations" element={<Designations />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="manager-leaves" element={<ManagerLeaves />} />
            <Route path="leave-balance" element={<LeaveBalanceManagement />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
