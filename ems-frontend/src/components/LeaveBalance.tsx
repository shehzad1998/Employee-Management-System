import React, { useEffect, useState } from 'react';
import { LeaveBalance } from '../types';
import { getEmployeeLeaveBalance } from '../services/api';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Progress } from 'antd';
import { useAuth } from '../contexts/AuthContext';

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

  const columns: ColumnsType<LeaveBalance> = [
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
      title: 'Total Days',
      dataIndex: 'maxDays',
      key: 'maxDays',
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
          percent={Math.round((record.usedDays / record.maxDays) * 100)}
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
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};

export default LeaveBalanceComponent; 