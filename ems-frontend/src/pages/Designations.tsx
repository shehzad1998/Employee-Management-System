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
import { Designation } from '../types';

const Designations: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [formData, setFormData] = useState({
    title: '',
  });

  const fetchDesignations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDesignations();
      setDesignations(data);
    } catch (err) {
      setError('Failed to fetch designations');
      console.error('Error fetching designations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleOpen = (designation?: Designation) => {
    if (designation) {
      setSelectedDesignation(designation);
      setFormData({ title: designation.title });
    } else {
      setSelectedDesignation(null);
      setFormData({ title: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDesignation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (selectedDesignation) {
        await api.updateDesignation(selectedDesignation.id, formData);
      } else {
        await api.createDesignation(formData);
      }
      fetchDesignations();
      handleClose();
    } catch (err) {
      setError(selectedDesignation ? 'Failed to update designation' : 'Failed to create designation');
      console.error('Error saving designation:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      setError(null);
      try {
        await api.deleteDesignation(id);
        fetchDesignations();
      } catch (err) {
        setError('Failed to delete designation');
        console.error('Error deleting designation:', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Designations</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Designation
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
              <TableCell>Title</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">Loading...</TableCell>
              </TableRow>
            ) : designations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">No designations found</TableCell>
              </TableRow>
            ) : (
              designations.map((designation) => (
                <TableRow key={designation.id}>
                  <TableCell>{designation.title}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(designation)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(designation.id)}>
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
          {selectedDesignation ? 'Edit Designation' : 'Add Designation'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ title: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedDesignation ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Designations; 