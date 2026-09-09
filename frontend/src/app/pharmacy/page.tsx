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
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Star,
  MapPin,
  Phone,
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockUser = {
  id: '1',
  firstName: 'HealthCare',
  lastName: 'Pharmacy',
  email: 'admin@healthcare-pharmacy.com',
  avatar: '/avatars/pharmacy.jpg',
};

const mockStats = {
  pendingOrders: 12,
  totalOrders: 245,
  monthlyRevenue: 125000,
  averageRating: 4.8,
};

const mockRecentOrders = [
  {
    id: '1',
    patientName: 'John Doe',
    items: 3,
    total: 450,
    status: 'PENDING',
    orderDate: '2024-01-15',
    prescriptionId: 'RX001',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    items: 2,
    total: 320,
    status: 'PREPARING',
    orderDate: '2024-01-15',
    prescriptionId: 'RX002',
  },
  {
    id: '3',
    patientName: 'Mike Johnson',
    items: 1,
    total: 180,
    status: 'READY_FOR_PICKUP',
    orderDate: '2024-01-14',
    prescriptionId: 'RX003',
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    items: 4,
    total: 680,
    status: 'DISPATCHED',
    orderDate: '2024-01-14',
    prescriptionId: 'RX004',
  },
];

const mockInventoryAlerts = [
  {
    id: '1',
    medicineName: 'Paracetamol 500mg',
    currentStock: 15,
    minStock: 50,
    supplier: 'PharmaCorp',
    priority: 'high',
  },
  {
    id: '2',
    medicineName: 'Amoxicillin 250mg',
    currentStock: 25,
    minStock: 40,
    supplier: 'MediSupply',
    priority: 'medium',
  },
  {
    id: '3',
    medicineName: 'Insulin Pen',
    currentStock: 8,
    minStock: 20,
    supplier: 'DiabetesCare',
    priority: 'high',
  },
];

const mockPharmacyInfo = {
  name: 'HealthCare Pharmacy',
  address: '123 Medical Street, Healthcare City',
  phone: '+91 9876543210',
  license: 'PH-2024-001',
  rating: 4.8,
  totalReviews: 156,
  deliveryRadius: '10 km',
  operatingHours: '9:00 AM - 9:00 PM',
};

export default function PharmacyDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY_FOR_PICKUP':
        return 'bg-green-100 text-green-800';
      case 'DISPATCHED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className='w-4 h-4' />;
      case 'PREPARING':
        return <Package className='w-4 h-4' />;
      case 'READY_FOR_PICKUP':
        return <CheckCircle className='w-4 h-4' />;
      case 'DISPATCHED':
        return <Truck className='w-4 h-4' />;
      default:
        return <AlertCircle className='w-4 h-4' />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole='PHARMACY' user={mockUser}>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole='PHARMACY' user={mockUser}>
      <div className='space-y-6'>
        {/* Welcome Section */}
        <div className='bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white'>
          <h1 className='text-2xl font-bold mb-2'>
            Welcome to {mockPharmacyInfo.name}
          </h1>
          <p className='text-purple-100'>
            You have {mockStats.pendingOrders} pending orders to process
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Pending Orders'
            value={mockStats.pendingOrders}
            description='Require immediate attention'
            icon={ShoppingCart}
            variant='warning'
            trend={{ value: 8, label: 'vs yesterday', isPositive: false }}
          />
          <StatsCard
            title='Total Orders'
            value={mockStats.totalOrders}
            description='This month'
            icon={Package}
            variant='success'
            trend={{ value: 15, label: 'vs last month', isPositive: true }}
          />
          <StatsCard
            title='Monthly Revenue'
            value={`₹${mockStats.monthlyRevenue.toLocaleString()}`}
            description='Current month earnings'
            icon={DollarSign}
            trend={{ value: 12, label: 'vs last month', isPositive: true }}
          />
          <StatsCard
            title='Average Rating'
            value={mockStats.averageRating}
            description='Based on customer reviews'
            icon={Star}
            variant='success'
          />
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Recent Orders */}
          <Card className='lg:col-span-2'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest medicine orders from patients
                </CardDescription>
              </div>
              <Button size='sm' variant='outline'>
                View All Orders
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {mockRecentOrders.map(order => (
                <div
                  key={order.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg'>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className='font-medium'>{order.patientName}</p>
                      <p className='text-sm text-gray-500'>
                        {order.items} items • ₹{order.total}
                      </p>
                      <p className='text-xs text-gray-400'>
                        Order: {order.orderDate} • Rx: {order.prescriptionId}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                    {order.status === 'PENDING' && (
                      <Button size='sm'>Process</Button>
                    )}
                    {order.status === 'READY_FOR_PICKUP' && (
                      <Button size='sm' variant='outline'>
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pharmacy Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Information</CardTitle>
              <CardDescription>Your store details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <MapPin className='w-4 h-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium'>Address</p>
                  <p className='text-xs text-gray-500'>
                    {mockPharmacyInfo.address}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Phone className='w-4 h-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium'>Contact</p>
                  <p className='text-xs text-gray-500'>
                    {mockPharmacyInfo.phone}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Star className='w-4 h-4 text-yellow-500' />
                <div>
                  <p className='text-sm font-medium'>Rating</p>
                  <p className='text-xs text-gray-500'>
                    {mockPharmacyInfo.rating}/5 ({mockPharmacyInfo.totalReviews}{' '}
                    reviews)
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Truck className='w-4 h-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium'>Delivery Radius</p>
                  <p className='text-xs text-gray-500'>
                    {mockPharmacyInfo.deliveryRadius}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Clock className='w-4 h-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium'>Operating Hours</p>
                  <p className='text-xs text-gray-500'>
                    {mockPharmacyInfo.operatingHours}
                  </p>
                </div>
              </div>
              <Button variant='outline' size='sm' className='w-full'>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Inventory Alerts */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Low stock medicines</CardDescription>
              </div>
              <Button size='sm' variant='outline'>
                Manage Inventory
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {mockInventoryAlerts.map(alert => (
                <div
                  key={alert.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex-1'>
                    <p className='font-medium'>{alert.medicineName}</p>
                    <p className='text-sm text-gray-500'>
                      Stock: {alert.currentStock} / Min: {alert.minStock}
                    </p>
                    <p className='text-xs text-gray-400'>
                      Supplier: {alert.supplier}
                    </p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                    <Button size='sm' variant='outline'>
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common pharmacy operations</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button className='w-full justify-start' variant='outline'>
                <ShoppingCart className='w-4 h-4 mr-2' />
                Process New Order
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Package className='w-4 h-4 mr-2' />
                Manage Inventory
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Users className='w-4 h-4 mr-2' />
                Customer Reviews
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <TrendingUp className='w-4 h-4 mr-2' />
                Sales Analytics
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <Truck className='w-4 h-4 mr-2' />
                Delivery Management
              </Button>
              <Button className='w-full justify-start' variant='outline'>
                <DollarSign className='w-4 h-4 mr-2' />
                Payment Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
