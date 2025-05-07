import React from 'react';
import { Box, Typography } from '@mui/material';
import LeaveBalanceManagementForm from '../components/LeaveBalanceManagement';

const LeaveBalanceManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Leave Balance Management
      </Typography>
      <LeaveBalanceManagementForm />
    </Box>
  );
};

export default LeaveBalanceManagementPage; 