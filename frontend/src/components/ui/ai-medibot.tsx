'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Send,
  User,
  Minimize2,
  Maximize2,
  MessageCircle,
  Loader2,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'health-tip' | 'warning' | 'success';
}

interface AIMedibotProps {
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AIMedibot({
  className,
  isMinimized = false,
  onToggleMinimize,
}: AIMedibotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm MediBot, your AI health assistant. I can help you with health questions, medication reminders, symptom checking, and general wellness advice. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let type: Message['type'] = 'text';

    // Health-related responses
    if (
      lowerMessage.includes('headache') ||
      lowerMessage.includes('head pain')
    ) {
      response =
        "I understand you're experiencing a headache. Here are some immediate steps: 1) Stay hydrated 2) Rest in a quiet, dark room 3) Apply a cold compress. If headaches persist or are severe, please consult with a doctor through our platform.";
      type = 'health-tip';
    } else if (
      lowerMessage.includes('fever') ||
      lowerMessage.includes('temperature')
    ) {
      response =
        'For fever management: 1) Monitor your temperature regularly 2) Stay hydrated 3) Rest adequately 4) Consider over-the-counter fever reducers if appropriate. If fever exceeds 103°F (39.4°C) or persists, seek immediate medical attention.';
      type = 'warning';
    } else if (
      lowerMessage.includes('medicine') ||
      lowerMessage.includes('medication')
    ) {
      response =
        'I can help you with medication information! You can view your current prescriptions, set medication reminders, or order medicines through our pharmacy partners. Would you like me to guide you to any specific section?';
      type = 'success';
    } else if (
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('doctor')
    ) {
      response =
        'I can help you book an appointment with our qualified doctors. We offer video consultations and in-person visits. Would you like me to show you available doctors or help you schedule an appointment?';
      type = 'success';
    } else if (
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('urgent')
    ) {
      response =
        '⚠️ For medical emergencies, please call emergency services immediately (911/108). For non-emergency urgent care, I can help you find the nearest available doctor or schedule a priority consultation.';
      type = 'warning';
    } else if (
      lowerMessage.includes('stress') ||
      lowerMessage.includes('anxiety')
    ) {
      response =
        'Managing stress is important for your health. Try: 1) Deep breathing exercises 2) Regular physical activity 3) Adequate sleep 4) Mindfulness or meditation. If stress becomes overwhelming, consider speaking with a mental health professional.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('diet') ||
      lowerMessage.includes('nutrition')
    ) {
      response =
        'Good nutrition is key to health! Focus on: 1) Balanced meals with fruits and vegetables 2) Adequate protein 3) Whole grains 4) Proper hydration. For personalized dietary advice, consult with our nutrition specialists.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('exercise') ||
      lowerMessage.includes('workout')
    ) {
      response =
        'Regular exercise is excellent for your health! Start with: 1) 30 minutes of moderate activity daily 2) Mix cardio and strength training 3) Listen to your body 4) Stay consistent. Consult a doctor before starting new exercise routines.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('sleep') ||
      lowerMessage.includes('insomnia')
    ) {
      response =
        'Quality sleep is crucial for health. Tips for better sleep: 1) Maintain a regular sleep schedule 2) Create a comfortable sleep environment 3) Avoid screens before bedtime 4) Limit caffeine late in the day.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('thank') ||
      lowerMessage.includes('thanks')
    ) {
      response =
        "You're welcome! I'm here to help with your health questions anytime. Remember, while I can provide general health information, always consult with healthcare professionals for personalized medical advice.";
      type = 'success';
    } else if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      response =
        "Hello! I'm here to help with your health and wellness questions. You can ask me about symptoms, medications, appointments, or general health advice. What would you like to know?";
    } else {
      // General health assistant response
      response =
        "I'm here to help with health-related questions and guide you through our Care Portal. I can assist with: 🩺 Symptom checking and health advice 💊 Medication information and reminders 📅 Appointment booking with doctors 🏥 Emergency guidance 💡 Wellness tips and lifestyle advice 📋 Health records and prescriptions. Could you please tell me more about what specific health topic or concern you'd like help with?";
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
      type,
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(userMessage.content);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment or contact our support team if the issue persists.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'warning',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type?: Message['type']) => {
    switch (type) {
      case 'health-tip':
        return <Heart className='w-4 h-4 text-green-500' />;
      case 'warning':
        return <AlertCircle className='w-4 h-4 text-orange-500' />;
      case 'success':
        return <CheckCircle className='w-4 h-4 text-blue-500' />;
      default:
        return <Bot className='w-4 h-4 text-primary' />;
    }
  };

  const getMessageBadgeColor = (type?: Message['type']) => {
    switch (type) {
      case 'health-tip':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'success':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  if (isMinimized) {
    return (
      <Button
        onClick={onToggleMinimize}
        className='fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50'
        size='icon'
      >
        <MessageCircle className='w-6 h-6' />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 w-96 h-[500px] shadow-xl z-50 flex flex-col ${className}`}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg'>
        <div className='flex items-center space-x-2'>
          <Bot className='w-5 h-5' />
          <div>
            <CardTitle className='text-lg'>MediBot AI</CardTitle>
            <CardDescription className='text-primary-foreground/80 text-sm'>
              Your Health Assistant
            </CardDescription>
          </div>
        </div>
        <div className='flex items-center space-x-1'>
          <div className='flex items-center space-x-1'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
            <span className='text-xs'>Online</span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={onToggleMinimize}
            className='h-8 w-8 text-white hover:bg-white/20'
          >
            <Minimize2 className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col p-0'>
        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-4'>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className='flex items-center space-x-2 mb-2'>
                      {getMessageIcon(message.type)}
                      <span className='text-xs font-medium'>MediBot</span>
                      {message.type && message.type !== 'text' && (
                        <Badge
                          className={`text-xs ${getMessageBadgeColor(message.type)}`}
                        >
                          {message.type === 'health-tip' && 'Health Tip'}
                          {message.type === 'warning' && 'Important'}
                          {message.type === 'success' && 'Helpful'}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className='text-sm leading-relaxed'>{message.content}</p>
                  <p className='text-xs opacity-70 mt-1'>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className='flex justify-start'>
                <div className='bg-gray-100 rounded-lg p-3 max-w-[80%]'>
                  <div className='flex items-center space-x-2'>
                    <Bot className='w-4 h-4 text-primary' />
                    <span className='text-xs font-medium'>
                      MediBot is typing
                    </span>
                    <Loader2 className='w-3 h-3 animate-spin' />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className='p-4 border-t'>
          <div className='flex space-x-2'>
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask about your health...'
              disabled={isLoading}
              className='flex-1'
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size='icon'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Send className='w-4 h-4' />
              )}
            </Button>
          </div>
          <p className='text-xs text-gray-500 mt-2 text-center'>
            MediBot provides general health information. Always consult
            healthcare professionals for medical advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
