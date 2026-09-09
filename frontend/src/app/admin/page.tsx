'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { StatsCard } from '@/components/ui/stats-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Shield,
  Store,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  FileText,
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockUser = {
  id: '1',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@telemed.com',
  avatar: '/avatars/admin.jpg',
};

const mockStats = {
  totalUsers: 1247,
  activeDoctors: 89,
  registeredPharmacies: 156,
  totalRevenue: 2450000,
  pendingApprovals: 12,
  activeAppointments: 45,
};

const mockRecentActivities = [
  {
    id: '1',
    type: 'doctor_registration',
    user: 'Dr. John Smith',
    action: 'New doctor registration',
    timestamp: '2 hours ago',
    status: 'pending',
  },
  {
    id: '2',
    type: 'pharmacy_approval',
    user: 'MediCare Pharmacy',
    action: 'Pharmacy license verification',
    timestamp: '4 hours ago',
    status: 'approved',
  },
  {
    id: '3',
    type: 'payment_dispute',
    user: 'Patient: Jane Doe',
    action: 'Payment dispute raised',
    timestamp: '6 hours ago',
    status: 'investigating',
  },
  {
    id: '4',
    type: 'system_alert',
    user: 'System',
    action: 'High server load detected',
    timestamp: '8 hours ago',
    status: 'resolved',
  },
];

const mockPendingApprovals = [
  {
    id: '1',
    type: 'doctor',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    registrationDate: '2024-01-14',
    documents: 'Complete',
    priority: 'high',
  },
  {
    id: '2',
    type: 'pharmacy',
    name: 'HealthPlus Pharmacy',
    location: 'Mumbai, Maharashtra',
    registrationDate: '2024-01-13',
    documents: 'Pending License',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'doctor',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrician',
    registrationDate: '2024-01-12',
    documents: 'Complete',
    priority: 'low',
  },
];

const mockSystemHealth = {
  serverUptime: '99.9%',
  activeConnections: 1247,
  databaseHealth: 'Good',
  paymentGateway: 'Online',
  videoService: 'Operational',
  lastBackup: '2 hours ago',
};

const mockTopMetrics = [
  { label: 'Daily Active Users', value: '2,847', change: '+12%' },
  { label: 'Successful Consultations', value: '156', change: '+8%' },
  { label: 'Medicine Orders', value: '89', change: '+15%' },
  { label: 'Revenue Today', value: '₹45,670', change: '+22%' },
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'investigating':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'doctor_registration':
        return <Shield className='w-4 h-4' />;
      case 'pharmacy_approval':
        return <Store className='w-4 h-4' />;
      case 'payment_dispute':
        return <DollarSign className='w-4 h-4' />;
      case 'system_alert':
        return <AlertTriangle className='w-4 h-4' />;
      default:
        return <Activity className='w-4 h-4' />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole='ADMIN' user={mockUser}>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole='ADMIN' user={mockUser}>
      <div className='space-y-6'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-6 text-white'>
          <h1 className='text-2xl font-bold mb-2'>Admin Dashboard</h1>
          <p className='text-red-100'>
            System overview and management controls
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Total Users'
            value={mockStats.totalUsers.toLocaleString()}
            description='Patients, doctors, pharmacies'
            icon={Users}
            trend={{ value: 8, label: 'vs last month', isPositive: true }}
          />
          <StatsCard
            title='Active Doctors'
            value={mockStats.activeDoctors}
            description='Verified and practicing'
            icon={Shield}
            variant='success'
            trend={{ value: 12, label: 'new this month', isPositive: true }}
          />
          <StatsCard
            title='Pharmacies'
            value={mockStats.registeredPharmacies}
            description='Registered and active'
            icon={Store}
            variant='success'
            trend={{ value: 5, label: 'new this month', isPositive: true }}
          />
          <StatsCard
            title='Total Revenue'
            value={`₹${(mockStats.totalRevenue / 100000).toFixed(1)}L`}
            description='Platform earnings'
            icon={DollarSign}
            trend={{ value: 18, label: 'vs last month', isPositive: true }}
          />
        </div>

        {/* Top Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Metrics</CardTitle>
            <CardDescription>Real-time platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {mockTopMetrics.map((metric, index) => (
                <div key={index} className='text-center p-4 border rounded-lg'>
                  <p className='text-2xl font-bold text-gray-900'>
                    {metric.value}
                  </p>
                  <p className='text-sm text-gray-600'>{metric.label}</p>
                  <Badge variant='outline' className='mt-2'>
                    {metric.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Pending Approvals */}
          <Card className='lg:col-span-2'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Registrations requiring review
                </CardDescription>
              </div>
              <Badge variant='destructive'>
                {mockStats.pendingApprovals} pending
              </Badge>
            </CardHeader>
            <CardContent className='space-y-4'>
              {mockPendingApprovals.map(approval => (
                <div
                  key={approval.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg'>
                      {approval.type === 'doctor' ? (
                        <Shield className='w-5 h-5' />
                      ) : (
                        <Store className='w-5 h-5' />
                      )}
                    </div>
                    <div>
                      <p className='font-medium'>{approval.name}</p>
                      <p className='text-sm text-gray-500'>
                        {approval.type === 'doctor'
                          ? approval.specialty
                          : approval.location}
                      </p>
                      <p className='text-xs text-gray-400'>
                        Applied: {approval.registrationDate} •{' '}
                        {approval.documents}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getPriorityColor(approval.priority)}>
                      {approval.priority}
                    </Badge>
                    <Button size='sm'>Review</Button>
                  </div>
                </div>
              ))}
              <Button variant='ghost' className='w-full'>
                View All Approvals
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Platform status overview</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Server Uptime</span>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                  <span className='font-medium'>
                    {mockSystemHealth.serverUptime}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Active Connections</span>
                <span className='font-medium'>
                  {mockSystemHealth.activeConnections}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Database</span>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                  <span className='font-medium'>
                    {mockSystemHealth.databaseHealth}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Payment Gateway</span>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                  <span className='font-medium'>
                    {mockSystemHealth.paymentGateway}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Video Service</span>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                  <span className='font-medium'>
                    {mockSystemHealth.videoService}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Last Backup</span>
                <span className='font-medium'>
                  {mockSystemHealth.lastBackup}
                </span>
              </div>
              <Button variant='outline' size='sm' className='w-full'>
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Recent Activities */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </div>
              <Button size='sm' variant='outline'>
                View All
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {mockRecentActivities.map(activity => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg'>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{activity.action}</p>
                      <p className='text-xs text-gray-500'>{activity.user}</p>
                      <p className='text-xs text-gray-400'>
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Administrative controls</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button className='w-full justify-start' variant='outline'>
                <Users className='w-4 h-4 mr-2' />
                Manage Users
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Shield className='w-4 h-4 mr-2' />
                Doctor Approvals
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Store className='w-4 h-4 mr-2' />
                Pharmacy Verification
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <DollarSign className='w-4 h-4 mr-2' />
                Payment Reports
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <TrendingUp className='w-4 h-4 mr-2' />
                Analytics Dashboard
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <FileText className='w-4 h-4 mr-2' />
                System Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
