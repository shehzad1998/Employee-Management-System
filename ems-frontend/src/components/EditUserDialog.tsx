import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import * as api from '../services/api';
import { Employee, EmployeeCreateUpdateDTO } from '../types';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
  userEmployee: Employee | null;
  onUserUpdate: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  user,
  userEmployee,
  onUserUpdate,
}) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    phone: userEmployee?.phone || '',
  });

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      phone: userEmployee?.phone || '',
    });
  }, [open, user, userEmployee]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password change state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userEmployee) {
        const updateData: EmployeeCreateUpdateDTO = {
          name: formData.username,
          phone: formData.phone,
          departmentId: userEmployee.departmentId,
          designationId: userEmployee.designationId,
          manager: userEmployee.manager,
          user: {
            username: userEmployee.username,
            email: userEmployee.userEmail,
            password: '', // Not updating password here
            roleId: 3, // Default to Employee, or use user.roleId if available
          },
        };

        // Update employee details
        await api.updateEmployee(userEmployee.id, updateData);

        // Update local storage with new user data
        const updatedUser = {
          ...user,
          username: formData.username,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        onUserUpdate();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user details');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    console.log('User object in EditUserDialog:', user);
    console.log('User ID:', user?.userId);
    console.log('User data type:', typeof user?.userId);
    
    if (!user?.userId) {
      setPasswordError('User ID not found. Please try logging out and logging back in.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.updateUserPassword(user.userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ width: '100%' }}>
            <TextField
              name="username"
              label="Username"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
            <TextField
              name="phone"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            {!showPasswordFields ? (
              <Button variant="outlined" type="button" onClick={() => setShowPasswordFields(true)}>
                Change Password
              </Button>
            ) : (
              <>
                <TextField
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
                <TextField
                  name="newPassword"
                  label="New Password"
                  type="password"
                  fullWidth
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
                <TextField
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  variant="outlined"
                  required
                />
                {passwordError && (
                  <Box sx={{ color: 'error.main', mt: 1 }}>{passwordError}</Box>
                )}
                {passwordSuccess && (
                  <Box sx={{ color: 'success.main', mt: 1 }}>{passwordSuccess}</Box>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    color="inherit"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    disabled={passwordLoading}
                    onClick={handlePasswordUpdate}
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
          {error && (
            <Box sx={{ color: 'error.main', mt: 2, textAlign: 'center' }}>
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog; 