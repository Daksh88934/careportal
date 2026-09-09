import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from './dashboard-layout';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('DashboardLayout', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: '/avatar.jpg',
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/patient');
    jest.clearAllMocks();
  });

  it('renders patient navigation correctly', () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('TeleMed')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Video Calls')).toBeInTheDocument();
    expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Medicine Orders')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  it('renders doctor navigation correctly', () => {
    render(
      <DashboardLayout userRole='DOCTOR' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Video Calls')).toBeInTheDocument();
    expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  it('renders pharmacy navigation correctly', () => {
    render(
      <DashboardLayout userRole='PHARMACY' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Medicines')).toBeInTheDocument();
    expect(screen.getByText('Store Profile')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders admin navigation correctly', () => {
    render(
      <DashboardLayout userRole='ADMIN' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Doctors')).toBeInTheDocument();
    expect(screen.getByText('Pharmacies')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('displays user information correctly', () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('patient')).toBeInTheDocument();
  });

  it('shows correct role badge colors', () => {
    const { rerender } = render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    let badge = screen.getByText('patient');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');

    rerender(
      <DashboardLayout userRole='DOCTOR' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    badge = screen.getByText('doctor');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');

    rerender(
      <DashboardLayout userRole='PHARMACY' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    badge = screen.getByText('pharmacy');
    expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');

    rerender(
      <DashboardLayout userRole='ADMIN' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    badge = screen.getByText('admin');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('handles mobile sidebar toggle', () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Find mobile menu button
    const menuButton = screen
      .getAllByRole('button')
      .find(button =>
        button.querySelector('svg')?.getAttribute('class')?.includes('w-5 h-5')
      );

    expect(menuButton).toBeInTheDocument();

    // Click to open sidebar
    fireEvent.click(menuButton!);

    // Sidebar should be visible (check for overlay)
    const overlay = document.querySelector('.fixed.inset-0.bg-gray-600');
    expect(overlay).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Click on user avatar to open dropdown
    const avatarButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(avatarButton);

    // Click logout
    const logoutButton = screen.getByText('Log out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/patient/appointments');

    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const appointmentsLink = screen.getByRole('link', {
      name: /appointments/i,
    });
    expect(appointmentsLink).toHaveClass('bg-primary', 'text-white');
  });

  it('renders children content', () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div data-testid='child-content'>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays notification badge', () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    const notificationBadge = screen.getByText('3');
    expect(notificationBadge).toBeInTheDocument();
    expect(notificationBadge).toHaveClass('bg-red-500');
  });

  it('handles user dropdown menu interactions', () => {
    render(
      <DashboardLayout userRole='PATIENT' user={mockUser}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Click on user avatar
    const avatarButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(avatarButton);

    // Check dropdown items
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('renders user avatar with fallback', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined };

    render(
      <DashboardLayout userRole='PATIENT' user={userWithoutAvatar}>
        <div>Test Content</div>
      </DashboardLayout>
    );

    // Should show initials as fallback
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
