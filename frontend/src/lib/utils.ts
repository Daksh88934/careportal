import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  const visiblePart = phone.slice(-4);
  const maskedPart = '*'.repeat(phone.length - 4);
  return maskedPart + visiblePart;
}

export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  const maskedUsername =
    username[0] + '*'.repeat(username.length - 2) + username.slice(-1);
  return maskedUsername + '@' + domain;
}

export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getTimeSlots(
  startTime: string,
  endTime: string,
  duration: number = 30
): string[] {
  const slots: string[] = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  let current = new Date(start);

  while (current < end) {
    slots.push(
      current.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
    current.setMinutes(current.getMinutes() + duration);
  }

  return slots;
}

export function isTimeSlotAvailable(
  slot: string,
  bookedSlots: string[],
  date: Date = new Date()
): boolean {
  const now = new Date();
  const slotDate = new Date(date);
  const [time, period] = slot.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  slotDate.setHours(
    period === 'PM' && hours !== 12
      ? hours + 12
      : hours === 12 && period === 'AM'
        ? 0
        : hours,
    minutes,
    0,
    0
  );

  // Check if slot is in the past
  if (slotDate <= now) return false;

  // Check if slot is already booked
  return !bookedSlots.includes(slot);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Appointment statuses
    REQUESTED: 'text-warning bg-warning/10',
    CONFIRMED: 'text-primary bg-primary/10',
    COMPLETED: 'text-success bg-success/10',
    CANCELLED: 'text-destructive bg-destructive/10',
    REJECTED: 'text-destructive bg-destructive/10',

    // Order statuses
    PLACED: 'text-warning bg-warning/10',
    PROCESSING: 'text-primary bg-primary/10',
    SHIPPED: 'text-secondary bg-secondary/10',
    DELIVERED: 'text-success bg-success/10',

    // Payment statuses
    PENDING: 'text-warning bg-warning/10',
    FAILED: 'text-destructive bg-destructive/10',
    REFUNDED: 'text-muted bg-muted/10',

    // User statuses
    ACTIVE: 'text-success bg-success/10',
    INACTIVE: 'text-muted bg-muted/10',
    VERIFIED: 'text-success bg-success/10',
    UNVERIFIED: 'text-warning bg-warning/10',
  };

  return statusColors[status.toUpperCase()] || 'text-muted bg-muted/10';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
