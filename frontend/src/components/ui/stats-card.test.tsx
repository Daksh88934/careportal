import { render, screen } from '@testing-library/react';
import { StatsCard } from './stats-card';
import { TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';

describe('StatsCard', () => {
  it('renders basic stats card with title and value', () => {
    render(
      <StatsCard
        title='Total Users'
        value='1,234'
        description='Active users this month'
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Active users this month')).toBeInTheDocument();
  });

  it('renders stats card with icon', () => {
    render(
      <StatsCard
        title='Total Users'
        value='1,234'
        description='Active users this month'
        icon={<Users data-testid='users-icon' />}
      />
    );

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders stats card with positive trend', () => {
    render(
      <StatsCard
        title='Revenue'
        value='$12,345'
        description='Monthly revenue'
        trend={{
          value: 15,
          isPositive: true,
        }}
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();

    // Check for trending up icon
    const trendElement = screen.getByText('+15%').closest('div');
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('renders stats card with negative trend', () => {
    render(
      <StatsCard
        title='Orders'
        value='456'
        description='This week'
        trend={{
          value: 8,
          isPositive: false,
        }}
      />
    );

    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('456')).toBeInTheDocument();
    expect(screen.getByText('-8%')).toBeInTheDocument();

    // Check for trending down styling
    const trendElement = screen.getByText('-8%').closest('div');
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('renders success variant with correct styling', () => {
    render(
      <StatsCard
        title='Completed Tasks'
        value='89%'
        description='Success rate'
        variant='success'
      />
    );

    const card = screen
      .getByText('Completed Tasks')
      .closest('div')?.parentElement;
    expect(card).toHaveClass('border-green-200', 'bg-green-50');
  });

  it('renders warning variant with correct styling', () => {
    render(
      <StatsCard
        title='Pending Reviews'
        value='23'
        description='Needs attention'
        variant='warning'
      />
    );

    const card = screen
      .getByText('Pending Reviews')
      .closest('div')?.parentElement;
    expect(card).toHaveClass('border-yellow-200', 'bg-yellow-50');
  });

  it('renders danger variant with correct styling', () => {
    render(
      <StatsCard
        title='Failed Requests'
        value='5'
        description='System errors'
        variant='danger'
      />
    );

    const card = screen
      .getByText('Failed Requests')
      .closest('div')?.parentElement;
    expect(card).toHaveClass('border-red-200', 'bg-red-50');
  });

  it('renders default variant when no variant specified', () => {
    render(
      <StatsCard
        title='Default Card'
        value='100'
        description='Default styling'
      />
    );

    const card = screen.getByText('Default Card').closest('div')?.parentElement;
    expect(card).toHaveClass('border-gray-200', 'bg-white');
  });

  it('renders with custom className', () => {
    render(
      <StatsCard
        title='Custom Card'
        value='999'
        description='With custom class'
        className='custom-stats-card'
      />
    );

    const card = screen.getByText('Custom Card').closest('div')?.parentElement;
    expect(card).toHaveClass('custom-stats-card');
  });

  it('renders with both icon and trend', () => {
    render(
      <StatsCard
        title='Appointments'
        value='42'
        description="Today's schedule"
        icon={<Calendar data-testid='calendar-icon' />}
        trend={{
          value: 12,
          isPositive: true,
        }}
      />
    );

    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('handles zero trend value', () => {
    render(
      <StatsCard
        title='Stable Metric'
        value='100'
        description='No change'
        trend={{
          value: 0,
          isPositive: true,
        }}
      />
    );

    expect(screen.getByText('Stable Metric')).toBeInTheDocument();
    expect(screen.getByText('+0%')).toBeInTheDocument();
  });

  it('renders large numbers correctly', () => {
    render(
      <StatsCard
        title='Big Number'
        value='1,234,567'
        description='Large value test'
      />
    );

    expect(screen.getByText('Big Number')).toBeInTheDocument();
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders with long description text', () => {
    const longDescription =
      'This is a very long description that should wrap properly and not break the card layout';

    render(
      <StatsCard
        title='Long Description'
        value='123'
        description={longDescription}
      />
    );

    expect(screen.getByText('Long Description')).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('applies correct text colors for different variants', () => {
    const { rerender } = render(
      <StatsCard
        title='Success Card'
        value='100%'
        description='Success description'
        variant='success'
      />
    );

    let titleElement = screen.getByText('Success Card');
    expect(titleElement).toHaveClass('text-green-800');

    rerender(
      <StatsCard
        title='Warning Card'
        value='50%'
        description='Warning description'
        variant='warning'
      />
    );

    titleElement = screen.getByText('Warning Card');
    expect(titleElement).toHaveClass('text-yellow-800');

    rerender(
      <StatsCard
        title='Danger Card'
        value='0%'
        description='Danger description'
        variant='danger'
      />
    );

    titleElement = screen.getByText('Danger Card');
    expect(titleElement).toHaveClass('text-red-800');
  });

  it('renders trend icon correctly for positive trend', () => {
    render(
      <StatsCard
        title='Growing Metric'
        value='150'
        description='Increasing value'
        trend={{
          value: 25,
          isPositive: true,
        }}
      />
    );

    // The TrendingUp icon should be present in the DOM
    const trendContainer = screen.getByText('+25%').parentElement;
    expect(trendContainer?.querySelector('svg')).toBeInTheDocument();
  });

  it('renders trend icon correctly for negative trend', () => {
    render(
      <StatsCard
        title='Declining Metric'
        value='75'
        description='Decreasing value'
        trend={{
          value: 10,
          isPositive: false,
        }}
      />
    );

    // The TrendingDown icon should be present in the DOM
    const trendContainer = screen.getByText('-10%').parentElement;
    expect(trendContainer?.querySelector('svg')).toBeInTheDocument();
  });

  it('maintains accessibility with proper heading structure', () => {
    render(
      <StatsCard
        title='Accessible Card'
        value='999'
        description='Accessibility test'
      />
    );

    // Title should be rendered as a heading
    const titleElement = screen.getByText('Accessible Card');
    expect(titleElement.tagName).toBe('H3');
  });
});
