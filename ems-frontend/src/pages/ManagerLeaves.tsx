import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  getLeaves,
  approveLeave,
  rejectLeave,
  getLeavesForManager,
} from '../services/api';
import { Leave } from '../types';

interface User {
  id: number;
  roleId: number;
}

const LeaveManagement: React.FC = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          throw new Error('No authentication data found');
        }

        let userData;
        try {
          userData = JSON.parse(userStr);
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          throw new Error('Invalid user data format');
        }

        if (!userData || typeof userData.employeeId !== 'number' || typeof userData.roleName !== 'string') {
          throw new Error('Invalid user data structure');
        }

        // Check if user is an admin or manager
        if (userData.roleId !== 1 && userData.roleId !== 2) {
          throw new Error('Access denied. Only admins and managers can view this page.');
        }

        setUser({
          id: userData.employeeId,
          roleId: userData.roleId
        });
      } catch (err) {
        console.error('Authentication error:', err);
        navigate('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLeaves();
    }
  }, [authLoading, user]);

  const fetchLeaves = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (user.roleId === 2) { // Manager
        // Use the updated function to get leaves for the manager
        data = await getLeavesForManager(user.id);
        console.log('Fetched leaves for manager:', data);
      } else { // Admin
        // For admin, get all leaves
        data = await getLeaves();
      }
      
      setLeaves(data);
    } catch (err: any) {
      console.error('Error fetching leaves:', err);
      const errorMessage = err.response?.data || err.message || 'Failed to fetch leaves';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leave: Leave) => {
    try {
      setLoading(true);
      setError('');
      const message = await approveLeave(leave.id);
      setSuccessMessage(message);
      await fetchLeaves();
    } catch (err: any) {
      console.error('Error approving leave:', err);
      const errorMessage = err.response?.data || err.message || 'Failed to approve leave';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;
    
    try {
      setLoading(true);
      setError('');
      const message = await rejectLeave(selectedLeave.id);
      setSuccessMessage(message);
      setRejectionDialog(false);
      setRejectionReason('');
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err: any) {
      console.error('Error rejecting leave:', err);
      const errorMessage = err.response?.data || err.message || 'Failed to reject leave';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          {user?.roleId === 1 ? 'All Leave Requests' : 'Team Leave Requests'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : leaves.length === 0 ? (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1">No leave requests found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow 
                  key={leave.id}
                  sx={{
                    backgroundColor: 
                      leave.status === 1 ? 'success.light' : 
                      leave.status === 2 ? 'error.light' : 
                      'inherit'
                  }}
                >
                  <TableCell>{leave.employeeName}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>
                    {new Date(leave.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(leave.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: 
                          leave.status === 1 ? 'success.main' : 
                          leave.status === 2 ? 'error.main' : 
                          'warning.main',
                        color: 'white'
                      }}
                    >
                      {leave.statusText}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {leave.status === 0 && (
                      <>
                        <Tooltip title="Approve Leave">
                          <IconButton
                            color="success"
                            onClick={() => handleApprove(leave)}
                            disabled={loading}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject Leave">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setRejectionDialog(true);
                            }}
                            disabled={loading}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Rejection Dialog */}
      <Dialog 
        open={rejectionDialog} 
        onClose={() => {
          if (!loading) {
            setRejectionDialog(false);
            setRejectionReason('');
            setSelectedLeave(null);
          }
        }}
      >
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setRejectionDialog(false);
              setRejectionReason('');
              setSelectedLeave(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject} 
            color="error"
            disabled={loading || !rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveManagement; 