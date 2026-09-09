'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoConsultation from '@/components/video/video-consultation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface AppointmentData {
  roomId: string;
  appointment: {
    id: string;
    scheduledAt: string;
    status: string;
    duration: number;
  };
  participants: {
    patient: {
      id: string;
      name: string;
      email: string;
    };
    doctor: {
      id: string;
      name: string;
      email: string;
    };
  };
  userRole: 'doctor' | 'patient';
}

export default function ConsultationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [appointmentData, setAppointmentData] =
    useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/video/consultation/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch room data');
        }

        const data = await response.json();
        setAppointmentData(data);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(
          'Failed to load consultation room. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Loader2 className='h-12 w-12 animate-spin mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>
              Loading Consultation Room
            </h2>
            <p className='text-muted-foreground'>
              Please wait while we prepare your video consultation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !appointmentData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Unable to Load Room</h2>
            <p className='text-muted-foreground mb-6'>
              {error ||
                'The consultation room could not be found or you do not have access to it.'}
            </p>
            <div className='space-y-2'>
              <Button
                onClick={() => window.location.reload()}
                className='w-full'
              >
                Try Again
              </Button>
              <Button
                variant='outline'
                onClick={() => router.push('/dashboard')}
                className='w-full'
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <VideoConsultation
        appointmentId={appointmentData.appointment.id}
        roomId={appointmentData.roomId}
        userRole={appointmentData.userRole}
        appointment={{
          id: appointmentData.appointment.id,
          scheduledAt: appointmentData.appointment.scheduledAt,
          patient: appointmentData.participants.patient,
          doctor: appointmentData.participants.doctor,
        }}
      />
    </div>
  );
}
