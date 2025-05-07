import React from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats } from '../types';
import LeaveBalanceComponent from './LeaveBalance';
import { getDashboardStats } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
    },
    {
      title: 'Employee Count',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
    },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={stats?.totalEmployees}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Departments"
              value={stats?.totalDepartments}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Designations"
              value={stats?.totalDesignations}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Department Distribution" loading={loading}>
            <Table
              dataSource={stats?.departmentDistribution}
              columns={departmentColumns}
              rowKey="departmentName"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <LeaveBalanceComponent />
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Recent Leaves" loading={loading}>
            <Table
              dataSource={stats?.recentLeaves}
              columns={[
                { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName' },
                { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
                { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
                { title: 'Type', dataIndex: 'leaveType', key: 'leaveType' },
                { title: 'Status', dataIndex: 'statusText', key: 'statusText' },
              ]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 