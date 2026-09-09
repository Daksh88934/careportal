'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Video,
  FileText,
  Pill,
  ShoppingCart,
  Store,
  CreditCard,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Activity,
  Home,
  Building2,
  Stethoscope,
  UserPlus,
  AlertOctagon,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN' | 'FRONTLINE_WORKER' | 'DISTRICT_OFFICER';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

const navigationItems = {
  FRONTLINE_WORKER: [
    { name: 'Frontline Dashboard', href: '/worker', icon: Home },
    { name: 'Register Patient', href: '/worker/register', icon: UserPlus },
    { name: 'Digital Triage', href: '/worker/triage', icon: Stethoscope },
    { name: 'Assisted Teleconsult', href: '/worker/teleconsult', icon: Video },
    { name: 'Referral Tracking', href: '/worker/referrals', icon: ArrowUpRight },
    { name: 'High-Risk Follow-Ups', href: '/worker/follow-ups', icon: ClipboardList },
    { name: 'Emergency SOS', href: '/worker/emergency', icon: AlertOctagon },
  ],
  DISTRICT_OFFICER: [
    { name: 'District Dashboard', href: '/district/dashboard', icon: Home },
    { name: 'Emergency Command', href: '/district/emergency', icon: AlertOctagon },
    { name: 'Facility Readiness', href: '/facility/inventory', icon: Building2 },
    { name: 'Referral Tracking', href: '/worker/referrals', icon: ArrowUpRight },
  ],
  PATIENT: [
    { name: 'Dashboard', href: '/patient', icon: Home },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Video Calls', href: '/patient/video', icon: Video },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
    { name: 'Medicine Orders', href: '/patient/orders', icon: ShoppingCart },
    { name: 'Payments', href: '/patient/payments', icon: CreditCard },
  ],
  DOCTOR: [
    { name: 'Dashboard', href: '/doctor', icon: Home },
    { name: 'Teleconsult Queue', href: '/doctor/teleconsult-queue', icon: Stethoscope },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'Video Calls', href: '/doctor/video', icon: Video },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
  ],
  PHARMACY: [
    { name: 'Dashboard', href: '/pharmacy', icon: Home },
    { name: 'Orders', href: '/pharmacy/orders', icon: ShoppingCart },
    { name: 'Medicines', href: '/pharmacy/medicines', icon: Pill },
    { name: 'Store Profile', href: '/pharmacy/profile', icon: Store },
    { name: 'Payments', href: '/pharmacy/payments', icon: CreditCard },
    { name: 'Analytics', href: '/pharmacy/analytics', icon: Activity },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'District Health View', href: '/district/dashboard', icon: Activity },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Doctors', href: '/admin/doctors', icon: Shield },
    { name: 'Pharmacies', href: '/admin/pharmacies', icon: Store },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  ],
};

export function DashboardLayout({
  children,
  userRole,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigation = navigationItems[userRole];

  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/auth/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'PATIENT':
        return 'bg-blue-100 text-blue-800';
      case 'DOCTOR':
        return 'bg-green-100 text-green-800';
      case 'PHARMACY':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        >
          <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex items-center justify-between h-16 px-6 border-b border-gray-200'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>C</span>
            </div>
            <span className='text-xl font-bold text-gray-900'>Care Portal</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='lg:hidden'
            onClick={() => setSidebarOpen(false)}
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        <nav className='mt-6 px-3'>
          <div className='space-y-1'>
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User profile section */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200'>
          <div className='flex items-center space-x-3'>
            <Avatar className='w-8 h-8'>
              <AvatarImage src={user.avatar} alt={user.firstName} />
              <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {user.firstName} {user.lastName}
              </p>
              <Badge className={cn('text-xs', getRoleBadgeColor(userRole))}>
                {userRole.toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top navigation */}
        <div className='sticky top-0 z-30 bg-white border-b border-gray-200'>
          <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
            <Button
              variant='ghost'
              size='sm'
              className='lg:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className='w-5 h-5' />
            </Button>

            <div className='flex items-center space-x-4 ml-auto'>
              {/* Notifications */}
              <Button variant='ghost' size='sm' className='relative'>
                <Bell className='w-5 h-5' />
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center'>
                  3
                </span>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-8 w-8 rounded-full'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user.avatar} alt={user.firstName} />
                      <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className='text-xs leading-none text-muted-foreground'>
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='flex-1'>
          <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
