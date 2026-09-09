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
  Calendar,
  Clock,
  Users,
  Video,
  FileText,
  TrendingUp,
  Star,
  Phone,
  MessageSquare,
  Activity,
  DollarSign,
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockUser = {
  id: '1',
  firstName: 'Dr. Sarah',
  lastName: 'Wilson',
  email: 'sarah.wilson@telemed.com',
  avatar: '/avatars/doctor.jpg',
};

const mockStats = {
  todayAppointments: 8,
  totalPatients: 156,
  pendingConsultations: 3,
  monthlyRevenue: 45000,
};

const mockTodaySchedule = [
  {
    id: '1',
    patientName: 'John Doe',
    time: '09:00 AM',
    type: 'Video Consultation',
    status: 'CONFIRMED',
    condition: 'Follow-up',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    time: '10:30 AM',
    type: 'Video Consultation',
    status: 'IN_PROGRESS',
    condition: 'Hypertension',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    time: '02:00 PM',
    type: 'Video Consultation',
    status: 'PENDING',
    condition: 'Diabetes Check',
  },
];

const mockRecentPatients = [
  {
    id: '1',
    name: 'Alice Brown',
    lastVisit: '2024-01-12',
    condition: 'Cardiology',
    status: 'Stable',
    avatar: '/avatars/patient1.jpg',
  },
  {
    id: '2',
    name: 'Robert Davis',
    lastVisit: '2024-01-10',
    condition: 'Hypertension',
    status: 'Monitoring',
    avatar: '/avatars/patient2.jpg',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    lastVisit: '2024-01-08',
    condition: 'Diabetes',
    status: 'Improving',
    avatar: '/avatars/patient3.jpg',
  },
];

const mockPendingActions = [
  {
    id: '1',
    type: 'prescription',
    patient: 'John Doe',
    description: 'Review and approve prescription',
    priority: 'high',
  },
  {
    id: '2',
    type: 'consultation',
    patient: 'Jane Smith',
    description: 'Follow-up consultation required',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'report',
    patient: 'Mike Johnson',
    description: 'Lab results review pending',
    priority: 'low',
  },
];

export default function DoctorDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <DashboardLayout userRole='DOCTOR' user={mockUser}>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole='DOCTOR' user={mockUser}>
      <div className='space-y-6'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white'>
          <h1 className='text-2xl font-bold mb-2'>
            Good morning, {mockUser.firstName}!
          </h1>
          <p className='text-green-100'>
            You have {mockStats.todayAppointments} appointments scheduled for
            today
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title="Today's Appointments"
            value={mockStats.todayAppointments}
            description='3 pending, 2 in progress'
            icon={Calendar}
            trend={{ value: 12, label: 'vs yesterday', isPositive: true }}
          />
          <StatsCard
            title='Total Patients'
            value={mockStats.totalPatients}
            description='Active patient base'
            icon={Users}
            variant='success'
            trend={{ value: 8, label: 'this month', isPositive: true }}
          />
          <StatsCard
            title='Pending Consultations'
            value={mockStats.pendingConsultations}
            description='Require attention'
            icon={Video}
            variant='warning'
          />
          <StatsCard
            title='Monthly Revenue'
            value={`₹${mockStats.monthlyRevenue.toLocaleString()}`}
            description='Current month earnings'
            icon={DollarSign}
            trend={{ value: 15, label: 'vs last month', isPositive: true }}
          />
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Today's Schedule */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {mockTodaySchedule.map(appointment => (
                <div
                  key={appointment.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex flex-col items-center'>
                      <Clock className='w-4 h-4 text-gray-400 mb-1' />
                      <span className='text-sm font-medium'>
                        {appointment.time}
                      </span>
                    </div>
                    <div>
                      <p className='font-medium'>{appointment.patientName}</p>
                      <p className='text-sm text-gray-500'>
                        {appointment.condition}
                      </p>
                      <p className='text-xs text-gray-400'>
                        {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                    {appointment.status === 'IN_PROGRESS' && (
                      <Button size='sm'>
                        <Video className='w-4 h-4 mr-2' />
                        Join Call
                      </Button>
                    )}
                    {appointment.status === 'CONFIRMED' && (
                      <Button size='sm' variant='outline'>
                        <Phone className='w-4 h-4 mr-2' />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant='ghost' className='w-full'>
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {mockPendingActions.map(action => (
                <div
                  key={action.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{action.patient}</p>
                    <p className='text-xs text-gray-500'>
                      {action.description}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(action.priority)}>
                    {action.priority}
                  </Badge>
                </div>
              ))}
              <Button variant='outline' size='sm' className='w-full'>
                View All Actions
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Recent Patients */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Recently consulted patients</CardDescription>
              </div>
              <Button size='sm' variant='outline'>
                View All
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {mockRecentPatients.map(patient => (
                <div
                  key={patient.id}
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>
                        {patient.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{patient.name}</p>
                      <p className='text-sm text-gray-500'>
                        {patient.condition}
                      </p>
                      <p className='text-xs text-gray-400'>
                        Last visit: {patient.lastVisit}
                      </p>
                    </div>
                  </div>
                  <Badge variant='outline'>{patient.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button className='w-full justify-start' variant='outline'>
                <Calendar className='w-4 h-4 mr-2' />
                View Schedule
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Users className='w-4 h-4 mr-2' />
                Patient Records
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <FileText className='w-4 h-4 mr-2' />
                Write Prescription
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Video className='w-4 h-4 mr-2' />
                Start Video Call
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <MessageSquare className='w-4 h-4 mr-2' />
                Patient Messages
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <TrendingUp className='w-4 h-4 mr-2' />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
