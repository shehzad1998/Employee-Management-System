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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import * as api from '../services/api';
import { Department } from '../types';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      setError('Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpen = (department?: Department) => {
    if (department) {
      setSelectedDepartment(department);
      setFormData({ name: department.name });
    } else {
      setSelectedDepartment(null);
      setFormData({ name: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDepartment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (selectedDepartment) {
        await api.updateDepartment(selectedDepartment.id, formData);
      } else {
        await api.createDepartment(formData);
      }
      fetchDepartments();
      handleClose();
    } catch (err) {
      setError(selectedDepartment ? 'Failed to update department' : 'Failed to create department');
      console.error('Error saving department:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setError(null);
      try {
        await api.deleteDepartment(id);
        fetchDepartments();
      } catch (err) {
        setError('Failed to delete department');
        console.error('Error deleting department:', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Departments</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Department
        </Button>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">Loading...</TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">No departments found</TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(department)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(department.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedDepartment ? 'Edit Department' : 'Add Department'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedDepartment ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Departments; 