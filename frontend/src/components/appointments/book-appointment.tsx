'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Clock,
  CreditCard,
  User,
  Stethoscope,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  userId: string;
  qualification: string;
  specialties: string[];
  consultFee: number;
  experience: number;
  rating: number;
  totalRatings: number;
  user: {
    name: string;
    email: string;
    profilePhoto?: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookAppointmentProps {
  doctor: Doctor;
  onSuccess?: (appointmentId: string) => void;
  onCancel?: () => void;
}

export default function BookAppointment({
  doctor,
  onSuccess,
  onCancel,
}: BookAppointmentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [step, setStep] = useState<'booking' | 'payment' | 'success'>(
    'booking'
  );
  const [appointmentId, setAppointmentId] = useState<string>('');

  // Generate time slots for selected date
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateTimeSlots = (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const slotDuration = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = setMinutes(setHours(date, hour), minute);
        const timeString = format(slotTime, 'HH:mm');

        // Mock availability - in real app, check against doctor's schedule
        const isAvailable = Math.random() > 0.3; // 70% availability

        slots.push({
          time: timeString,
          available: isAvailable,
        });
      }
    }

    setTimeSlots(slots);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !symptoms.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          scheduledAt: scheduledAt.toISOString(),
          symptoms,
          notes,
          amount: doctor.consultFee,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      const data = await response.json();
      setAppointmentId(data.id);
      setStep('payment');

      toast({
        title: 'Appointment Booked',
        description: 'Please proceed with payment to confirm your appointment',
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);

    try {
      // Create payment order
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          appointmentId,
          amount: doctor.consultFee,
          currency: 'INR',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const paymentData = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Care Portal',
        description: `Consultation with Dr. ${doctor.user.name}`,
        order_id: paymentData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                appointmentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              setStep('success');
              toast({
                title: 'Payment Successful',
                description: 'Your appointment has been confirmed!',
              });

              if (onSuccess) {
                onSuccess(appointmentId);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support for assistance',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: 'Patient Name', // Get from user context
          email: 'patient@example.com', // Get from user context
          contact: '9999999999', // Get from user context
        },
        theme: {
          color: '#3B82F6',
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className='w-full max-w-2xl mx-auto'>
        <CardContent className='p-8 text-center'>
          <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold mb-2'>Appointment Confirmed!</h2>
          <p className='text-muted-foreground mb-6'>
            Your consultation with Dr. {doctor.user.name} has been successfully
            booked.
          </p>

          <div className='bg-muted p-4 rounded-lg mb-6'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <Label className='font-medium'>Date & Time</Label>
                <p>
                  {selectedDate && format(selectedDate, 'PPP')} at{' '}
                  {selectedTime}
                </p>
              </div>
              <div>
                <Label className='font-medium'>Consultation Fee</Label>
                <p>₹{doctor.consultFee}</p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <Button
              onClick={() => (window.location.href = '/patient/appointments')}
              className='w-full'
            >
              View My Appointments
            </Button>
            <Button variant='outline' onClick={onCancel} className='w-full'>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'payment') {
    return (
      <Card className='w-full max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <CreditCard className='h-5 w-5 mr-2' />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Appointment Summary */}
          <div className='bg-muted p-4 rounded-lg'>
            <h3 className='font-medium mb-3'>Appointment Summary</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Doctor:</span>
                <span>Dr. {doctor.user.name}</span>
              </div>
              <div className='flex justify-between'>
                <span>Date & Time:</span>
                <span>
                  {selectedDate && format(selectedDate, 'PPP')} at{' '}
                  {selectedTime}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Consultation Fee:</span>
                <span>₹{doctor.consultFee}</span>
              </div>
              <div className='flex justify-between font-medium border-t pt-2'>
                <span>Total Amount:</span>
                <span>₹{doctor.consultFee}</span>
              </div>
            </div>
          </div>

          <div className='flex space-x-3'>
            <Button
              onClick={handlePayment}
              disabled={paymentLoading}
              className='flex-1'
            >
              {paymentLoading ? 'Processing...' : 'Pay Now'}
            </Button>
            <Button
              variant='outline'
              onClick={() => setStep('booking')}
              className='flex-1'
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>Book Appointment</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Doctor Info */}
        <div className='flex items-start space-x-4 p-4 bg-muted rounded-lg'>
          <Avatar className='h-16 w-16'>
            <AvatarImage src={doctor.user.profilePhoto} />
            <AvatarFallback>
              <Stethoscope className='h-8 w-8' />
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <h3 className='font-semibold text-lg'>Dr. {doctor.user.name}</h3>
            <p className='text-muted-foreground'>{doctor.qualification}</p>
            <div className='flex items-center space-x-4 mt-2'>
              <div className='flex items-center'>
                <Star className='h-4 w-4 fill-yellow-400 text-yellow-400 mr-1' />
                <span className='text-sm'>
                  {doctor.rating} ({doctor.totalRatings} reviews)
                </span>
              </div>
              <Badge variant='secondary'>{doctor.experience} years exp.</Badge>
            </div>
            <div className='flex flex-wrap gap-1 mt-2'>
              {doctor.specialties.map((specialty, index) => (
                <Badge key={index} variant='outline' className='text-xs'>
                  {specialty}
                </Badge>
              ))}
            </div>
            <p className='font-semibold text-lg mt-2'>₹{doctor.consultFee}</p>
          </div>
        </div>

        {/* Date Selection */}
        <div className='space-y-2'>
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-full justify-start text-left font-normal'
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={date =>
                  date < new Date() || date > addDays(new Date(), 30)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className='space-y-2'>
            <Label>Select Time</Label>
            <div className='grid grid-cols-4 gap-2'>
              {timeSlots.map(slot => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  size='sm'
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className='text-xs'
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div className='space-y-2'>
          <Label htmlFor='symptoms'>Symptoms / Reason for Visit *</Label>
          <Textarea
            id='symptoms'
            placeholder='Describe your symptoms or reason for consultation...'
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            rows={3}
          />
        </div>

        {/* Additional Notes */}
        <div className='space-y-2'>
          <Label htmlFor='notes'>Additional Notes (Optional)</Label>
          <Textarea
            id='notes'
            placeholder="Any additional information you'd like to share..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-3'>
          <Button
            onClick={handleBookAppointment}
            disabled={
              loading || !selectedDate || !selectedTime || !symptoms.trim()
            }
            className='flex-1'
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
          <Button variant='outline' onClick={onCancel} className='flex-1'>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
