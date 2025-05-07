import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  getLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  getEmployeeLeaves,
  getLeavesForManager,
  getEmployeeLeaveBalance,
} from "../services/api";
import { Leave, LeaveApplyDTO, LeaveBalance } from "../types";

interface User {
  id: number;
  roleId: number;
}

const Leaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    leaveMasterId: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveBalanceLoading, setLeaveBalanceLoading] = useState(true);
  const [leaveBalanceError, setLeaveBalanceError] = useState("");

  const fetchLeaveBalances = async (employeeId: number) => {
    try {
      setLeaveBalanceLoading(true);
      setLeaveBalanceError("");
      const balances = await getEmployeeLeaveBalance(employeeId);
      setLeaveBalances(balances);
    } catch (err) {
      setLeaveBalanceError("Failed to fetch leave balances");
    } finally {
      setLeaveBalanceLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (!token || !userStr) {
          throw new Error("No authentication data found");
        }
        let userData;
        try {
          userData = JSON.parse(userStr);
        } catch (parseError) {
          throw new Error("Invalid user data format");
        }
        if (!userData || typeof userData.employeeId !== "number" || typeof userData.roleId !== "number") {
          throw new Error("Invalid user data structure");
        }
        setUser({ id: userData.employeeId, roleId: userData.roleId });
        fetchLeaves({ employeeId: userData.employeeId, roleId: userData.roleId });
        fetchLeaveBalances(userData.employeeId);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const isAdmin = user?.roleId === 1; // Assuming roleId 1 is Admin
  const isManager = user?.roleId === 2;

  const fetchLeaves = async (userData: { employeeId: number; roleId: number }) => {
    try {
      setLoading(true);
      // Always fetch only the logged-in user's own leaves
      const data = await getEmployeeLeaves(userData.employeeId);
      setLeaves(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch leaves";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.leaveMasterId ||
      !user?.id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const startDate = formData.startDate;
      const endDate = formData.endDate;

      const leaveData: LeaveApplyDTO = {
        employeeId: user.id,
        startDate: startDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
        leaveMasterId: Number(formData.leaveMasterId),
      };

      await createLeave(leaveData);
      setFormData({
        leaveMasterId: "",
        startDate: null,
        endDate: null,
      });
      await fetchLeaves({ employeeId: user.id, roleId: user.roleId });
      setSnackbar({
        open: true,
        message: "Leave application submitted successfully",
        severity: "success",
      });
      setOpenDialog(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit leave application";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (leave: Leave) => {
    try {
      setLoading(true);
      await approveLeave(leave.id);
      fetchLeaves({ employeeId: user!.id, roleId: user!.roleId });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to approve leave";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;

    try {
      setLoading(true);
      await rejectLeave(selectedLeave.id);
      setRejectionDialog(false);
      setSelectedLeave(null);
      setRejectionReason("");
      fetchLeaves({ employeeId: user!.id, roleId: user!.roleId });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reject leave";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Add this computed value to find the selected leave balance
  const selectedLeaveBalance = leaveBalances.find(
    (balance) => balance.leaveMasterId === Number(formData.leaveMasterId)
  );

  if (authLoading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Please login to access leave management.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Leave Balance Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          My Leave Balances
        </Typography>
        {leaveBalanceError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {leaveBalanceError}
          </Alert>
        )}
        {leaveBalanceLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Max Days Allowed</TableCell>
                  <TableCell>Used Days</TableCell>
                  <TableCell>Remaining Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>{balance.leaveType}</TableCell>
                    <TableCell>{balance.maxDays}</TableCell>
                    <TableCell>{balance.usedDays}</TableCell>
                    <TableCell>{balance.remainingDays}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">My Leave Requests</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}>
          Apply for Leave
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
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
                {(isManager || isAdmin) && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.employeeName}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.statusText}</TableCell>
                  {(isAdmin || isManager) && leave.status === "Pending" && (
                    <TableCell>
                      <IconButton
                        color="success"
                        onClick={() => handleApprove(leave)}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedLeave(leave);
                          setRejectionDialog(true);
                        }}>
                        <CloseIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Apply for Leave Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              value={formData.leaveMasterId}
              onChange={(e) =>
                setFormData({ ...formData, leaveMasterId: e.target.value })
              }
              required
              sx={{ mb: 2 }}>
              <MenuItem value={1}>Sick Leave</MenuItem>
              <MenuItem value={2}>Annual Leave</MenuItem>
              <MenuItem value={3}>Personal Leave</MenuItem>
            </TextField>
            {/* Show remaining leave balance for selected type as a Chip */}
            {formData.leaveMasterId && selectedLeaveBalance && (
              <Chip
                icon={<CalendarTodayIcon />}
                label={`${selectedLeaveBalance.remainingDays} days left`}
                color={selectedLeaveBalance.remainingDays <= 3 ? 'error' : 'primary'}
                sx={{ mb: 2, mt: 0, fontWeight: 600 }}
                variant="outlined"
              />
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) =>
                  setFormData({ ...formData, startDate: date })
                }
                sx={{ mb: 2, width: "100%" }}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                sx={{ mb: 2, width: "100%" }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)}>
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Leaves;
