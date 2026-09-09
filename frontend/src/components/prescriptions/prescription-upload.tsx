'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Pill,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionUploadProps {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PrescriptionUpload({
  appointmentId,
  patientName,
  doctorName,
  onSuccess,
  onCancel,
}: PrescriptionUploadProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    },
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);

  useEffect(() => {
    fetchAvailableMedicines();
  }, []);

  const fetchAvailableMedicines = async () => {
    try {
      const response = await fetch('/api/medicines?limit=100', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableMedicines(data.medicines || []);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const addMedicine = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    setMedicines([...medicines, newMedicine]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(med => med.id !== id));
    }
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(
      medicines.map(med => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleSubmit = async () => {
    // Validate required fields
    const validMedicines = medicines.filter(
      med => med.name.trim() && med.dosage.trim()
    );

    if (validMedicines.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one medicine with name and dosage',
        variant: 'destructive',
      });
      return;
    }

    if (!diagnosis.trim()) {
      toast({
        title: 'Missing Diagnosis',
        description: 'Please provide a diagnosis',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const prescriptionData = {
        appointmentId,
        content: {
          diagnosis,
          medicines: validMedicines,
          notes,
          followUpDate: followUpDate || null,
        },
        notes,
      };

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create prescription');
      }

      const result = await response.json();

      toast({
        title: 'Prescription Created',
        description: 'Prescription has been successfully created and saved',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: 'Error',
        description: 'Failed to create prescription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/prescriptions/${appointmentId}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${appointmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto p-4 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <FileText className='h-5 w-5 mr-2' />
            Create Prescription
          </CardTitle>
          <div className='text-sm text-muted-foreground'>
            <p>
              Patient: <span className='font-medium'>{patientName}</span>
            </p>
            <p>
              Doctor: <span className='font-medium'>Dr. {doctorName}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Diagnosis */}
          <div className='space-y-2'>
            <Label htmlFor='diagnosis'>Diagnosis *</Label>
            <Textarea
              id='diagnosis'
              placeholder='Enter diagnosis...'
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              rows={3}
            />
          </div>

          {/* Medicines */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-base font-medium'>Medicines</Label>
              <Button onClick={addMedicine} size='sm' variant='outline'>
                <Plus className='h-4 w-4 mr-2' />
                Add Medicine
              </Button>
            </div>

            {medicines.map((medicine, index) => (
              <Card key={medicine.id} className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label>Medicine Name *</Label>
                    <Input
                      placeholder='Enter medicine name'
                      value={medicine.name}
                      onChange={e =>
                        updateMedicine(medicine.id, 'name', e.target.value)
                      }
                      list={`medicines-${medicine.id}`}
                    />
                    <datalist id={`medicines-${medicine.id}`}>
                      {availableMedicines.map(med => (
                        <option key={med.id} value={med.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className='space-y-2'>
                    <Label>Dosage *</Label>
                    <Input
                      placeholder='e.g., 500mg'
                      value={medicine.dosage}
                      onChange={e =>
                        updateMedicine(medicine.id, 'dosage', e.target.value)
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Frequency</Label>
                    <Input
                      placeholder='e.g., Twice daily'
                      value={medicine.frequency}
                      onChange={e =>
                        updateMedicine(medicine.id, 'frequency', e.target.value)
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Duration</Label>
                    <Input
                      placeholder='e.g., 7 days'
                      value={medicine.duration}
                      onChange={e =>
                        updateMedicine(medicine.id, 'duration', e.target.value)
                      }
                    />
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label>Instructions</Label>
                    <Input
                      placeholder='e.g., Take after meals'
                      value={medicine.instructions}
                      onChange={e =>
                        updateMedicine(
                          medicine.id,
                          'instructions',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {medicines.length > 1 && (
                  <div className='flex justify-end mt-4'>
                    <Button
                      onClick={() => removeMedicine(medicine.id)}
                      size='sm'
                      variant='destructive'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Remove
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Separator />

          {/* Additional Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Additional Notes</Label>
            <Textarea
              id='notes'
              placeholder='Any additional instructions or notes...'
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Follow-up Date */}
          <div className='space-y-2'>
            <Label htmlFor='followUp'>Follow-up Date (Optional)</Label>
            <Input
              id='followUp'
              type='date'
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className='flex-1'
            >
              {loading ? 'Creating...' : 'Create Prescription'}
            </Button>

            <Button onClick={generatePDF} variant='outline' className='flex-1'>
              <Download className='h-4 w-4 mr-2' />
              Generate PDF
            </Button>

            <Button onClick={onCancel} variant='outline' className='flex-1'>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescription Preview */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Prescription Preview</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='bg-muted p-4 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 text-sm mb-4'>
              <div>
                <p className='font-medium'>Patient:</p>
                <p>{patientName}</p>
              </div>
              <div>
                <p className='font-medium'>Doctor:</p>
                <p>Dr. {doctorName}</p>
              </div>
            </div>

            {diagnosis && (
              <div className='mb-4'>
                <p className='font-medium text-sm mb-1'>Diagnosis:</p>
                <p className='text-sm'>{diagnosis}</p>
              </div>
            )}

            {medicines.some(med => med.name) && (
              <div className='mb-4'>
                <p className='font-medium text-sm mb-2'>Medicines:</p>
                <div className='space-y-2'>
                  {medicines
                    .filter(med => med.name.trim())
                    .map((medicine, index) => (
                      <div
                        key={medicine.id}
                        className='flex items-start space-x-2 text-sm'
                      >
                        <Badge variant='outline' className='text-xs'>
                          {index + 1}
                        </Badge>
                        <div className='flex-1'>
                          <p className='font-medium'>{medicine.name}</p>
                          <p className='text-muted-foreground'>
                            {medicine.dosage}
                            {medicine.frequency && ` - ${medicine.frequency}`}
                            {medicine.duration && ` for ${medicine.duration}`}
                          </p>
                          {medicine.instructions && (
                            <p className='text-xs text-muted-foreground italic'>
                              {medicine.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {notes && (
              <div className='mb-4'>
                <p className='font-medium text-sm mb-1'>Notes:</p>
                <p className='text-sm'>{notes}</p>
              </div>
            )}

            {followUpDate && (
              <div>
                <p className='font-medium text-sm mb-1'>Follow-up:</p>
                <p className='text-sm'>
                  {new Date(followUpDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
