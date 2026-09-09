'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  FileText,
  Clock,
  User,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoConsultationProps {
  appointmentId: string;
  roomId?: string;
  userRole: 'doctor' | 'patient';
  appointment: {
    id: string;
    scheduledAt: string;
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
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function VideoConsultation({
  appointmentId,
  roomId,
  userRole,
  appointment,
}: VideoConsultationProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    // Load Jitsi Meet API script
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setIsJitsiLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://8x8.vc/external_api.js';
      script.async = true;
      script.onload = () => {
        setIsJitsiLoaded(true);
      };
      script.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to load video calling service',
          variant: 'destructive',
        });
      };
      document.head.appendChild(script);
    };

    loadJitsiScript();

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isJitsiLoaded && roomId && jitsiContainerRef.current && !jitsiApi) {
      initializeJitsiMeet();
    }
  }, [isJitsiLoaded, roomId]);

  const initializeJitsiMeet = async () => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

    try {
      // Get video room details from backend
      const response = await fetch(`/api/video/room/details/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get room details');
      }

      const roomData = await response.json();

      const options = {
        roomName: roomId,
        width: '100%',
        height: '400px',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          requireDisplayName: true,
          enableClosePage: false,
          toolbarButtons: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'invite',
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'videobackgroundblur',
            'download',
            'help',
            'mute-everyone',
          ],
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'invite',
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'videobackgroundblur',
            'download',
            'help',
            'mute-everyone',
          ],
          SETTINGS_SECTIONS: [
            'devices',
            'language',
            'moderator',
            'profile',
            'calendar',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
          APP_NAME: 'CareX Video Consultation',
          NATIVE_APP_NAME: 'CareX',
          PROVIDER_NAME: 'CareX Platform',
        },
        userInfo: {
          displayName:
            userRole === 'doctor'
              ? appointment.doctor.name
              : appointment.patient.name,
          email:
            userRole === 'doctor'
              ? appointment.doctor.email
              : appointment.patient.email,
        },
      };

      const api = new window.JitsiMeetExternalAPI('8x8.vc', options);
      setJitsiApi(api);

      // Event listeners
      api.addEventListener('videoConferenceJoined', () => {
        setCallStarted(true);
        toast({
          title: 'Joined Call',
          description: 'Successfully joined the video consultation',
        });
      });

      api.addEventListener('videoConferenceLeft', () => {
        setCallEnded(true);
        setCallStarted(false);
      });

      api.addEventListener('participantJoined', (participant: any) => {
        setParticipants(prev => [...prev, participant.displayName]);
        toast({
          title: 'Participant Joined',
          description: `${participant.displayName} joined the call`,
        });
      });

      api.addEventListener('participantLeft', (participant: any) => {
        setParticipants(prev =>
          prev.filter(name => name !== participant.displayName)
        );
        toast({
          title: 'Participant Left',
          description: `${participant.displayName} left the call`,
        });
      });

      api.addEventListener('audioMuteStatusChanged', (event: any) => {
        setIsAudioMuted(event.muted);
      });

      api.addEventListener('videoMuteStatusChanged', (event: any) => {
        setIsVideoMuted(event.muted);
      });
    } catch (error) {
      console.error('Error initializing Jitsi Meet:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize video call',
        variant: 'destructive',
      });
    }
  };

  const endCall = async () => {
    if (userRole !== 'doctor') {
      toast({
        title: 'Access Denied',
        description: 'Only doctors can end the consultation',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/video/call/end/${appointmentId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        if (jitsiApi) {
          jitsiApi.executeCommand('hangup');
        }
        setCallEnded(true);
        toast({
          title: 'Call Ended',
          description: 'Video consultation has been ended',
        });
      }
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: 'Error',
        description: 'Failed to end the call',
        variant: 'destructive',
      });
    }
  };

  const toggleAudio = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
    }
  };

  const openPrescription = () => {
    // Navigate to prescription page
    window.open(`/prescriptions/create/${appointmentId}`, '_blank');
  };

  if (callEnded) {
    return (
      <Card className='w-full max-w-4xl mx-auto'>
        <CardContent className='p-8 text-center'>
          <div className='mb-4'>
            <PhoneOff className='h-16 w-16 mx-auto text-red-500 mb-4' />
            <h2 className='text-2xl font-bold mb-2'>Consultation Ended</h2>
            <p className='text-muted-foreground mb-6'>
              The video consultation has been completed.
            </p>
          </div>

          {userRole === 'doctor' && (
            <div className='space-y-4'>
              <Button onClick={openPrescription} className='w-full'>
                <FileText className='h-4 w-4 mr-2' />
                Create Prescription
              </Button>
            </div>
          )}

          <Button
            variant='outline'
            onClick={() => window.close()}
            className='mt-4'
          >
            Close Window
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='w-full max-w-6xl mx-auto p-4 space-y-4'>
      {/* Header */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Avatar>
                <AvatarFallback>
                  {userRole === 'doctor' ? 'DR' : 'PT'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className='text-lg'>Video Consultation</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {userRole === 'doctor'
                    ? `with ${appointment.patient.name}`
                    : `with Dr. ${appointment.doctor.name}`}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Badge variant={callStarted ? 'default' : 'secondary'}>
                {callStarted ? 'Connected' : 'Connecting...'}
              </Badge>
              <div className='flex items-center text-sm text-muted-foreground'>
                <Clock className='h-4 w-4 mr-1' />
                {new Date(appointment.scheduledAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Container */}
      <Card>
        <CardContent className='p-0'>
          <div
            ref={jitsiContainerRef}
            className='w-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden'
          >
            {!isJitsiLoaded && (
              <div className='flex items-center justify-center h-[400px]'>
                <div className='text-center'>
                  <Video className='h-16 w-16 mx-auto text-gray-400 mb-4' />
                  <p className='text-gray-400'>Loading video call...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-center space-x-4'>
            <Button
              variant={isAudioMuted ? 'destructive' : 'default'}
              size='lg'
              onClick={toggleAudio}
            >
              {isAudioMuted ? (
                <MicOff className='h-5 w-5' />
              ) : (
                <Mic className='h-5 w-5' />
              )}
            </Button>

            <Button
              variant={isVideoMuted ? 'destructive' : 'default'}
              size='lg'
              onClick={toggleVideo}
            >
              {isVideoMuted ? (
                <VideoOff className='h-5 w-5' />
              ) : (
                <Video className='h-5 w-5' />
              )}
            </Button>

            {userRole === 'doctor' && (
              <>
                <Button variant='outline' size='lg' onClick={openPrescription}>
                  <FileText className='h-5 w-5 mr-2' />
                  Prescription
                </Button>

                <Button variant='destructive' size='lg' onClick={endCall}>
                  <PhoneOff className='h-5 w-5 mr-2' />
                  End Call
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>
              Participants ({participants.length + 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>
                <User className='h-3 w-3 mr-1' />
                You
              </Badge>
              {participants.map((participant, index) => (
                <Badge key={index} variant='outline'>
                  <User className='h-3 w-3 mr-1' />
                  {participant}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
