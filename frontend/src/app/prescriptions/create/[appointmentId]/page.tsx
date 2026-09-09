'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PrescriptionUpload from '@/components/prescriptions/prescription-upload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface AppointmentData {
  id: string;
  scheduledAt: string;
  status: string;
  patient: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  doctor: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function CreatePrescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [appointmentData, setAppointmentData] =
    useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const fetchAppointmentData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch appointment data');
        }

        const data = await response.json();

        // Check if user is the doctor for this appointment
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (
            userData.role !== 'DOCTOR' ||
            data.doctor.userId !== userData.id
          ) {
            setError(
              'Access denied. Only the assigned doctor can create prescriptions.'
            );
            return;
          }
        }

        setAppointmentData(data);
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError(
          'Failed to load appointment data. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId, router]);

  const handleSuccess = () => {
    router.push('/doctor/appointments');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-8 text-center'>
            <Loader2 className='h-12 w-12 animate-spin mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Loading Appointment</h2>
            <p className='text-muted-foreground'>
              Please wait while we load the appointment details...
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
            <h2 className='text-xl font-semibold mb-2'>
              Unable to Load Appointment
            </h2>
            <p className='text-muted-foreground mb-6'>
              {error ||
                'The appointment could not be found or you do not have access to it.'}
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
                onClick={() => router.push('/doctor/appointments')}
                className='w-full'
              >
                Back to Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background py-8'>
      <PrescriptionUpload
        appointmentId={appointmentData.id}
        patientName={appointmentData.patient.user.name}
        doctorName={appointmentData.doctor.user.name}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
