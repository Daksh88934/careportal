'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { StatsCard } from '@/components/ui/stats-card'
import { AIMedibot } from '@/components/ui/ai-medibot'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  FileText,
  ShoppingCart,
  Video,
  Plus,
  ArrowRight,
  Activity,
  Heart,
  Thermometer,
  Scale,
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: '/avatars/patient.jpg',
}

const mockStats = {
  upcomingAppointments: 2,
  activeOrders: 1,
  prescriptions: 5,
  completedConsultations: 12,
}

const mockAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    date: '2024-01-15',
    time: '10:00 AM',
    type: 'Video Consultation',
    status: 'CONFIRMED',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'General Physician',
    date: '2024-01-18',
    time: '2:30 PM',
    type: 'In-Person',
    status: 'PENDING',
    doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
  },
]

const mockOrders = [
  {
    id: '1',
    pharmacyName: 'HealthCare Pharmacy',
    items: 3,
    total: 450,
    status: 'PREPARING',
    estimatedDelivery: '2024-01-16',
  },
]

const mockVitals = {
  heartRate: 72,
  bloodPressure: '120/80',
  temperature: 98.6,
  weight: 70,
  lastUpdated: '2024-01-14',
}

export default function PatientDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMedibotMinimized, setIsMedibotMinimized] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800'
      case 'DISPATCHED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="PATIENT" user={mockUser}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="PATIENT" user={mockUser}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {mockUser.firstName}!
          </h1>
          <p className="text-primary-foreground/80">
            Here's your health overview for today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Upcoming Appointments"
            value={mockStats.upcomingAppointments}
            description="Next: Today at 10:00 AM"
            icon={Calendar}
            trend={{ value: 15, label: 'vs last month', isPositive: true }}
          />
          <StatsCard
            title="Active Orders"
            value={mockStats.activeOrders}
            description="1 order in preparation"
            icon={ShoppingCart}
            variant="warning"
          />
          <StatsCard
            title="Prescriptions"
            value={mockStats.prescriptions}
            description="2 active prescriptions"
            icon={FileText}
            variant="success"
          />
          <StatsCard
            title="Consultations"
            value={mockStats.completedConsultations}
            description="Total completed"
            icon={Video}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled consultations</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Book New
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={appointment.doctorAvatar} alt={appointment.doctorName} />
                      <AvatarFallback>
                        {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{appointment.doctorName}</p>
                      <p className="text-sm text-gray-500">{appointment.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.toLowerCase()}
                    </Badge>
                    {appointment.status === 'CONFIRMED' && (
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full">
                View All Appointments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Health Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Health Vitals</CardTitle>
              <CardDescription>Last updated: {mockVitals.lastUpdated}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Heart Rate</span>
                </div>
                <span className="font-medium">{mockVitals.heartRate} bpm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Blood Pressure</span>
                </div>
                <span className="font-medium">{mockVitals.bloodPressure} mmHg</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className="font-medium">{mockVitals.temperature}°F</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Weight</span>
                </div>
                <span className="font-medium">{mockVitals.weight} kg</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Update Vitals
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your medicine orders</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{order.pharmacyName}</p>
                    <p className="text-sm text-gray-500">
                      {order.items} items • ₹{order.total}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Est. delivery: {order.estimatedDelivery}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toLowerCase()}
                  </Badge>
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
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Prescriptions
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Order Medicines
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Video className="w-4 h-4 mr-2" />
                Join Video Call
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setIsMedibotMinimized(false)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Chat with AI MediBot
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Medibot */}
      <AIMedibot 
        isMinimized={isMedibotMinimized}
        onToggleMinimize={() => setIsMedibotMinimized(!isMedibotMinimized)}
      />
    </DashboardLayout>
  )
}
