import React, { useEffect, useState } from 'react';
import { LeaveBalance } from '../types';
import { getEmployeeLeaveBalance } from '../services/api';
import { Card, Table, Typography, Progress } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const LeaveBalanceComponent: React.FC = () => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        if (user?.employeeId) {
          const balances = await getEmployeeLeaveBalance(user.employeeId);
          setLeaveBalances(balances);
        }
      } catch (error) {
        console.error('Error fetching leave balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalances();
  }, [user?.employeeId]);

  const columns = [
    {
      title: 'Leave Type',
      dataIndex: 'leaveTypeName',
      key: 'leaveTypeName',
    },
    {
      title: 'Total Days',
      dataIndex: 'totalDays',
      key: 'totalDays',
    },
    {
      title: 'Used Days',
      dataIndex: 'usedDays',
      key: 'usedDays',
    },
    {
      title: 'Remaining Days',
      dataIndex: 'remainingDays',
      key: 'remainingDays',
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: LeaveBalance) => (
        <Progress
          percent={Math.round((record.usedDays / record.totalDays) * 100)}
          status={record.remainingDays < 5 ? 'exception' : 'normal'}
        />
      ),
    },
  ];

  return (
    <Card title="Leave Balance" loading={loading}>
      <Table
        dataSource={leaveBalances}
        columns={columns}
        rowKey="leaveTypeId"
        pagination={false}
      />
    </Card>
  );
};

export default LeaveBalanceComponent; 