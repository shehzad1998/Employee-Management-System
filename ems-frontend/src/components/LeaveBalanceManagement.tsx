import React, { useEffect, useState } from 'react';
import { LeaveBalance, Employee } from '../types';
import { getEmployeeLeaveBalance, updateLeaveBalance, getEmployees } from '../services/api';
import { Table, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

const { Option } = Select;

const LeaveBalanceManagementForm: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(undefined);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeList = await getEmployees();
        setEmployees(employeeList);
      } catch (error) {
        console.error('Error fetching employees:', error);
        message.error('Failed to fetch employees');
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (selectedEmployee) {
        try {
          setLoading(true);
          const balances = await getEmployeeLeaveBalance(Number(selectedEmployee));
          setLeaveBalances(balances);
        } catch (error) {
          console.error('Error fetching leave balances:', error);
          message.error('Failed to fetch leave balances');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLeaveBalances();
  }, [selectedEmployee]);

  const handleUpdateBalance = async (leaveBalanceId: number, newMaxDays: number) => {
    if (!selectedEmployee) return;

    try {
      // Find the leave balance record
      const leaveBalance = leaveBalances.find(lb => lb.id === leaveBalanceId);
      if (!leaveBalance) return;
      await updateLeaveBalance(Number(selectedEmployee), leaveBalance.leaveMasterId, newMaxDays);
      message.success('Leave balance updated successfully');
      // Refresh the balances
      const updatedBalances = await getEmployeeLeaveBalance(Number(selectedEmployee));
      setLeaveBalances(updatedBalances);
    } catch (error) {
      console.error('Error updating leave balance:', error);
      message.error('Failed to update leave balance');
    }
  };

  const columns: ColumnsType<LeaveBalance> = [
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
      title: 'Current Max Days',
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
      title: 'New Max Days',
      key: 'newMaxDays',
      render: (_: unknown, record: LeaveBalance) => (
        <Input
          type="number"
          defaultValue={record.maxDays}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseInt(e.target.value);
            if (!isNaN(newValue) && newValue >= record.usedDays) {
              handleUpdateBalance(record.id, newValue);
            }
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>Leave Balance Management</h2>
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Select Employee"
          onChange={(value: string) => setSelectedEmployee(value)}
          value={selectedEmployee}
        >
          {employees.map((employee) => (
            <Option key={employee.id} value={employee.id.toString()}>
              {employee.name} ({employee.departmentName})
            </Option>
          ))}
        </Select>
      </div>

      {selectedEmployee && (
        <Table
          dataSource={leaveBalances}
          columns={columns}
          rowKey={(record) => record.id.toString()}
          loading={loading}
          pagination={false}
        />
      )}
    </div>
  );
};

export default LeaveBalanceManagementForm; 