'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default',
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'danger':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <Card className={cn(getVariantStyles(), className)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-gray-600'>
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', getIconStyles())}>
          <Icon className='h-4 w-4' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-gray-900'>{value}</div>
        {description && (
          <p className='text-xs text-gray-500 mt-1'>{description}</p>
        )}
        {trend && (
          <div className='flex items-center mt-2'>
            <Badge
              variant={trend.isPositive ? 'default' : 'destructive'}
              className='text-xs'
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </Badge>
            <span className='text-xs text-gray-500 ml-2'>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
