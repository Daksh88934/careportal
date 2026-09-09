import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PatientDashboard from './page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/patient'),
}));

// Mock DashboardLayout component
jest.mock('@/components/ui/dashboard-layout', () => ({
  DashboardLayout: ({ children, userRole, user }: any) => (
    <div
      data-testid='dashboard-layout'
      data-role={userRole}
      data-user={JSON.stringify(user)}
    >
      {children}
    </div>
  ),
}));

// Mock UI components
jest.mock('@/components/ui/stats-card', () => ({
  StatsCard: ({ title, value, description, trend }: any) => (
    <div data-testid='stats-card'>
      <h3>{title}</h3>
      <div>{value}</div>
      <p>{description}</p>
      {trend && (
        <span data-testid='trend'>
          {trend.isPositive ? '+' : '-'}
          {trend.value}%
        </span>
      )}
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid='card'>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid='card-content'>{children}</div>
  ),
  CardDescription: ({ children }: any) => (
    <p data-testid='card-description'>{children}</p>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid='card-header'>{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid='card-title'>{children}</h2>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      data-testid='button'
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid='badge'>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => (
    <div className={className} data-testid='avatar'>
      {children}
    </div>
  ),
  AvatarFallback: ({ children }: any) => (
    <div data-testid='avatar-fallback'>{children}</div>
  ),
  AvatarImage: ({ src, alt }: any) => (
    <img src={src} alt={alt} data-testid='avatar-image' />
  ),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('PatientDashboard', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<PatientDashboard />);

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  it('renders dashboard content after loading', async () => {
    render(<PatientDashboard />);

    await waitFor(
      () => {
        expect(
          screen.queryByRole('generic', { name: /loading/i })
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check welcome section
    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    expect(
      screen.getByText("Here's your health overview for today")
    ).toBeInTheDocument();
  });

  it('displays correct user role and information', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const dashboardLayout = screen.getByTestId('dashboard-layout');
      expect(dashboardLayout).toHaveAttribute('data-role', 'PATIENT');

      const userData = JSON.parse(
        dashboardLayout.getAttribute('data-user') || '{}'
      );
      expect(userData.firstName).toBe('John');
      expect(userData.lastName).toBe('Doe');
      expect(userData.email).toBe('john.doe@example.com');
    });
  });

  it('renders all stats cards with correct data', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const statsCards = screen.getAllByTestId('stats-card');
      expect(statsCards).toHaveLength(4);

      // Check stats card titles
      expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
      expect(screen.getByText('Active Orders')).toBeInTheDocument();
      expect(screen.getByText('Prescriptions')).toBeInTheDocument();
      expect(screen.getByText('Consultations')).toBeInTheDocument();

      // Check stats values
      expect(screen.getByText('2')).toBeInTheDocument(); // Upcoming appointments
      expect(screen.getByText('1')).toBeInTheDocument(); // Active orders
      expect(screen.getByText('5')).toBeInTheDocument(); // Prescriptions
      expect(screen.getByText('12')).toBeInTheDocument(); // Consultations
    });
  });

  it('displays upcoming appointments correctly', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
      expect(
        screen.getByText('Your scheduled consultations')
      ).toBeInTheDocument();

      // Check appointment details
      expect(screen.getByText('Dr. Sarah Wilson')).toBeInTheDocument();
      expect(screen.getByText('Cardiologist')).toBeInTheDocument();
      expect(screen.getByText('Dr. Michael Chen')).toBeInTheDocument();
      expect(screen.getByText('General Physician')).toBeInTheDocument();

      // Check appointment times
      expect(screen.getByText('2024-01-15 at 10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('2024-01-18 at 2:30 PM')).toBeInTheDocument();
    });
  });

  it('shows correct appointment status badges', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      const statusBadges = badges.filter(
        badge =>
          badge.textContent === 'confirmed' || badge.textContent === 'pending'
      );
      expect(statusBadges).toHaveLength(2);
    });
  });

  it('displays health vitals section', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Health Vitals')).toBeInTheDocument();
      expect(screen.getByText('Last updated: 2024-01-14')).toBeInTheDocument();

      // Check vital signs
      expect(screen.getByText('Heart Rate')).toBeInTheDocument();
      expect(screen.getByText('72 bpm')).toBeInTheDocument();
      expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
      expect(screen.getByText('120/80 mmHg')).toBeInTheDocument();
      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getByText('98.6°F')).toBeInTheDocument();
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('70 kg')).toBeInTheDocument();
    });
  });

  it('displays recent orders section', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      expect(screen.getByText('Your medicine orders')).toBeInTheDocument();

      // Check order details
      expect(screen.getByText('HealthCare Pharmacy')).toBeInTheDocument();
      expect(screen.getByText('3 items • ₹450')).toBeInTheDocument();
      expect(screen.getByText('Est. delivery: 2024-01-16')).toBeInTheDocument();
    });
  });

  it('displays quick actions section', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(
        screen.getByText('Common tasks and shortcuts')
      ).toBeInTheDocument();

      // Check quick action buttons
      expect(screen.getByText('Book Appointment')).toBeInTheDocument();
      expect(screen.getByText('View Prescriptions')).toBeInTheDocument();
      expect(screen.getByText('Order Medicines')).toBeInTheDocument();
      expect(screen.getByText('Join Video Call')).toBeInTheDocument();
    });
  });

  it('shows trend indicators on stats cards', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const trendIndicators = screen.getAllByTestId('trend');
      expect(trendIndicators.length).toBeGreaterThan(0);

      // Check for positive trend indicator
      const positiveTrend = trendIndicators.find(trend =>
        trend.textContent?.includes('+15%')
      );
      expect(positiveTrend).toBeInTheDocument();
    });
  });

  it('renders all action buttons', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check for specific buttons
      expect(screen.getByText('Book New')).toBeInTheDocument();
      expect(screen.getByText('View All Appointments')).toBeInTheDocument();
      expect(screen.getByText('Update Vitals')).toBeInTheDocument();
      expect(screen.getByText('View All')).toBeInTheDocument();
    });
  });

  it('displays correct card structure', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);

      const cardHeaders = screen.getAllByTestId('card-header');
      const cardContents = screen.getAllByTestId('card-content');

      expect(cardHeaders.length).toBeGreaterThan(0);
      expect(cardContents.length).toBeGreaterThan(0);
    });
  });

  it('handles video call button for confirmed appointments', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      // Should show "Join Call" button for confirmed appointments
      expect(screen.getByText('Join Call')).toBeInTheDocument();
    });
  });

  it('shows correct appointment status styling', async () => {
    render(<PatientDashboard />);

    await waitFor(() => {
      const confirmedBadge = screen.getByText('confirmed');
      const pendingBadge = screen.getByText('pending');

      expect(confirmedBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });
});
