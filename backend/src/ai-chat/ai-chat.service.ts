import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'health-tip' | 'warning' | 'success';
  userId?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(private prisma: PrismaService) {}

  async processMessage(
    userMessage: string,
    userId?: string
  ): Promise<ChatResponse> {
    try {
      // Log the conversation for analytics and improvement
      if (userId) {
        await this.logConversation(userId, userMessage, 'user');
      }

      const response = await this.generateResponse(userMessage);

      // Log bot response
      if (userId) {
        await this.logConversation(userId, response.content, 'bot');
      }

      return {
        message: response,
        suggestions: this.generateSuggestions(userMessage),
      };
    } catch (error) {
      this.logger.error('Error processing chat message:', error);
      return {
        message: {
          id: Date.now().toString(),
          content:
            "I apologize, but I'm having trouble responding right now. Please try again in a moment or contact our support team if the issue persists.",
          sender: 'bot',
          timestamp: new Date(),
          type: 'warning',
        },
      };
    }
  }

  private async generateResponse(userMessage: string): Promise<ChatMessage> {
    // Simulate AI processing delay
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1500)
    );

    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let type: ChatMessage['type'] = 'text';

    // Health-related responses with more comprehensive coverage
    if (
      lowerMessage.includes('headache') ||
      lowerMessage.includes('head pain') ||
      lowerMessage.includes('migraine')
    ) {
      response =
        "I understand you're experiencing a headache. Here are some immediate steps: 1) Stay hydrated with water 2) Rest in a quiet, dark room 3) Apply a cold compress to your forehead 4) Try gentle neck stretches. If headaches persist, are severe, or accompanied by fever, vision changes, or neck stiffness, please consult with a doctor through our platform immediately.";
      type = 'health-tip';
    } else if (
      lowerMessage.includes('fever') ||
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('hot') ||
      lowerMessage.includes('chills')
    ) {
      response =
        'For fever management: 1) Monitor your temperature every 2-4 hours 2) Stay well-hydrated with water, clear broths, or electrolyte solutions 3) Rest adequately 4) Dress in lightweight clothing 5) Consider acetaminophen or ibuprofen if appropriate for your age and health conditions. ⚠️ Seek immediate medical attention if fever exceeds 103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms.';
      type = 'warning';
    } else if (
      lowerMessage.includes('cough') ||
      lowerMessage.includes('throat') ||
      lowerMessage.includes('sore throat')
    ) {
      response =
        'For cough and throat discomfort: 1) Stay hydrated with warm liquids like tea with honey 2) Use throat lozenges or gargle with warm salt water 3) Consider a humidifier 4) Avoid irritants like smoke. If cough persists for more than 2 weeks, produces blood, or is accompanied by high fever, please consult a doctor.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('stomach') ||
      lowerMessage.includes('nausea') ||
      lowerMessage.includes('vomit') ||
      lowerMessage.includes('diarrhea')
    ) {
      response =
        'For digestive issues: 1) Stay hydrated with small, frequent sips of clear fluids 2) Try the BRAT diet (bananas, rice, applesauce, toast) 3) Avoid dairy, fatty, or spicy foods 4) Rest and avoid solid foods if nauseous. Seek medical care if symptoms persist for more than 24-48 hours, or if you have signs of dehydration.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('medicine') ||
      lowerMessage.includes('medication') ||
      lowerMessage.includes('prescription') ||
      lowerMessage.includes('pills')
    ) {
      response =
        'I can help you with medication information! Through our platform you can: 1) View your current prescriptions and dosage instructions 2) Set medication reminders 3) Order medicines from verified pharmacy partners 4) Check drug interactions 5) Consult with pharmacists. Would you like me to guide you to any specific medication service?';
      type = 'success';
    } else if (
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('doctor') ||
      lowerMessage.includes('consultation')
    ) {
      response =
        'I can help you book an appointment with our qualified doctors! We offer: 1) Video consultations (available 24/7) 2) In-person visits 3) Specialist referrals 4) Emergency consultations. Our doctors are verified and licensed. Would you like me to show you available doctors in your area or help you schedule based on your symptoms?';
      type = 'success';
    } else if (
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('urgent') ||
      lowerMessage.includes('chest pain') ||
      lowerMessage.includes('difficulty breathing')
    ) {
      response =
        '🚨 EMERGENCY: For life-threatening emergencies including chest pain, difficulty breathing, severe bleeding, loss of consciousness, or suspected heart attack/stroke, call emergency services immediately (911/108/112). For non-emergency urgent care, I can help you find the nearest available doctor or schedule a priority consultation within minutes.';
      type = 'warning';
    } else if (
      lowerMessage.includes('stress') ||
      lowerMessage.includes('anxiety') ||
      lowerMessage.includes('worried') ||
      lowerMessage.includes('panic')
    ) {
      response =
        'Managing stress and anxiety is crucial for your health. Try these techniques: 1) Deep breathing: Inhale for 4 counts, hold for 4, exhale for 6 2) Progressive muscle relaxation 3) Regular physical activity (even 10-minute walks help) 4) Adequate sleep (7-9 hours) 5) Mindfulness or meditation apps 6) Limit caffeine and alcohol. If anxiety becomes overwhelming or interferes with daily life, consider speaking with our mental health professionals.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('diet') ||
      lowerMessage.includes('nutrition') ||
      lowerMessage.includes('food') ||
      lowerMessage.includes('eating')
    ) {
      response =
        'Good nutrition is fundamental to health! Focus on: 1) Balanced meals with colorful fruits and vegetables (aim for 5-9 servings daily) 2) Lean proteins (fish, poultry, legumes, nuts) 3) Whole grains over refined carbs 4) Healthy fats (olive oil, avocados, nuts) 5) Proper hydration (8-10 glasses of water daily) 6) Limit processed foods, sugar, and excessive salt. For personalized dietary advice or medical nutrition therapy, consult with our registered dietitians.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('exercise') ||
      lowerMessage.includes('workout') ||
      lowerMessage.includes('fitness') ||
      lowerMessage.includes('physical activity')
    ) {
      response =
        'Regular exercise is excellent for physical and mental health! Guidelines: 1) Aim for 150 minutes of moderate aerobic activity weekly 2) Include strength training 2-3 times per week 3) Start slowly and gradually increase intensity 4) Choose activities you enjoy 5) Listen to your body and rest when needed 6) Stay hydrated during exercise. Always consult a doctor before starting new exercise routines, especially if you have health conditions.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('sleep') ||
      lowerMessage.includes('insomnia') ||
      lowerMessage.includes('tired') ||
      lowerMessage.includes('fatigue')
    ) {
      response =
        'Quality sleep is essential for health and recovery. Sleep hygiene tips: 1) Maintain a consistent sleep schedule (same bedtime/wake time daily) 2) Create a comfortable, cool, dark sleep environment 3) Avoid screens 1 hour before bedtime 4) Limit caffeine after 2 PM 5) Establish a relaxing bedtime routine 6) Avoid large meals and alcohol before sleep 7) Get morning sunlight exposure. If sleep problems persist, consult our sleep specialists.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('blood pressure') ||
      lowerMessage.includes('hypertension') ||
      lowerMessage.includes('bp')
    ) {
      response =
        "Blood pressure management is crucial for heart health. Lifestyle approaches: 1) Reduce sodium intake (<2300mg daily) 2) Maintain healthy weight 3) Regular physical activity 4) Limit alcohol consumption 5) Manage stress effectively 6) Don't smoke 7) Monitor BP regularly at home. Normal BP is <120/80 mmHg. If your BP is consistently elevated, please consult with our cardiologists for proper evaluation and treatment.";
      type = 'health-tip';
    } else if (
      lowerMessage.includes('diabetes') ||
      lowerMessage.includes('blood sugar') ||
      lowerMessage.includes('glucose')
    ) {
      response =
        'Blood sugar management is vital for diabetes care: 1) Monitor blood glucose as recommended 2) Follow your prescribed meal plan 3) Take medications as directed 4) Stay physically active 5) Manage stress 6) Get regular check-ups 7) Care for your feet daily 8) Stay hydrated. Target blood sugar levels vary by individual - consult our endocrinologists for personalized diabetes management plans.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('weight') ||
      lowerMessage.includes('obesity') ||
      lowerMessage.includes('lose weight') ||
      lowerMessage.includes('diet plan')
    ) {
      response =
        'Healthy weight management involves sustainable lifestyle changes: 1) Create a moderate caloric deficit (500-750 calories/day for 1-2 lbs/week loss) 2) Focus on whole, unprocessed foods 3) Practice portion control 4) Include regular physical activity 5) Stay hydrated 6) Get adequate sleep 7) Track your progress. Avoid crash diets or extreme restrictions. Consult our nutritionists and physicians for personalized weight management plans.';
      type = 'health-tip';
    } else if (
      lowerMessage.includes('mental health') ||
      lowerMessage.includes('depression') ||
      lowerMessage.includes('sad') ||
      lowerMessage.includes('mood')
    ) {
      response =
        "Mental health is as important as physical health. Signs to watch for: persistent sadness, loss of interest, changes in appetite/sleep, difficulty concentrating. Self-care strategies: 1) Maintain social connections 2) Regular exercise 3) Adequate sleep 4) Stress management 5) Mindfulness practices 6) Limit alcohol/substances. If you're experiencing persistent mental health concerns, our licensed therapists and psychiatrists are here to help. Don't hesitate to reach out.";
      type = 'health-tip';
    } else if (
      lowerMessage.includes('vaccine') ||
      lowerMessage.includes('vaccination') ||
      lowerMessage.includes('immunization')
    ) {
      response =
        'Vaccinations are crucial for preventing serious diseases. Stay up-to-date with: 1) Annual flu shots 2) COVID-19 vaccines and boosters 3) Routine adult vaccines (Tdap, MMR, etc.) 4) Travel vaccines if needed 5) Age-specific vaccines (shingles, pneumonia for older adults). Our healthcare providers can review your vaccination history and recommend appropriate immunizations based on your age, health status, and risk factors.';
      type = 'success';
    } else if (
      lowerMessage.includes('thank') ||
      lowerMessage.includes('thanks') ||
      lowerMessage.includes('appreciate')
    ) {
      response =
        "You're very welcome! I'm here to help with your health questions anytime. Remember, while I can provide general health information and guidance, always consult with our qualified healthcare professionals for personalized medical advice, diagnosis, and treatment. Your health and well-being are our top priority! 💙";
      type = 'success';
    } else if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey') ||
      lowerMessage.includes('good morning') ||
      lowerMessage.includes('good afternoon')
    ) {
      response =
        "Hello! I'm MediBot, your AI health assistant. I'm here to help with health and wellness questions, guide you through our telemedicine platform, and provide general medical information. I can assist with: symptom checking, medication information, appointment booking, health tips, and connecting you with our healthcare professionals. What would you like to know about your health today?";
      type = 'success';
    } else if (
      lowerMessage.includes('how are you') ||
      lowerMessage.includes('how do you feel')
    ) {
      response =
        "Thank you for asking! As an AI, I don't have feelings, but I'm functioning well and ready to help you with your health concerns! I'm constantly learning to provide better health guidance and support. How are YOU feeling today? Is there anything about your health or wellness that I can help you with?";
      type = 'success';
    } else {
      // General health assistant response with more helpful guidance
      response =
        "I'm here to help with health-related questions and guide you through our telemedicine platform. I can assist with: 🩺 Symptom checking and health advice 💊 Medication information and reminders 📅 Appointment booking with doctors 🏥 Emergency guidance 💡 Wellness tips and lifestyle advice 📋 Health records and prescriptions. Could you please tell me more about what specific health topic or concern you'd like help with?";
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'bot',
      timestamp: new Date(),
      type,
    };
  }

  private generateSuggestions(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('headache') || lowerMessage.includes('pain')) {
      return [
        'Book appointment with neurologist',
        'View pain management tips',
        'Check medication interactions',
      ];
    } else if (
      lowerMessage.includes('fever') ||
      lowerMessage.includes('sick')
    ) {
      return [
        'Find nearest urgent care',
        'Schedule video consultation',
        'View symptom tracker',
      ];
    } else if (
      lowerMessage.includes('medicine') ||
      lowerMessage.includes('medication')
    ) {
      return [
        'View my prescriptions',
        'Set medication reminders',
        'Order medicines online',
      ];
    } else if (
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('doctor')
    ) {
      return [
        'Book video consultation',
        'Find doctors near me',
        'View upcoming appointments',
      ];
    }

    return [
      'Book an appointment',
      'View health records',
      'Order medicines',
      'Emergency contacts',
    ];
  }

  private async logConversation(
    userId: string,
    message: string,
    sender: 'user' | 'bot'
  ): Promise<void> {
    try {
      // In a real implementation, you might want to create a chat_logs table
      // For now, we'll use a simple logging approach
      this.logger.log(
        `Chat - User: ${userId}, Sender: ${sender}, Message: ${message.substring(0, 100)}...`
      );

      // You could also store this in the database for analytics:
      // await this.prisma.chatLog.create({
      //   data: {
      //     userId,
      //     message,
      //     sender,
      //     timestamp: new Date(),
      //   },
      // });
    } catch (error) {
      this.logger.error('Error logging conversation:', error);
    }
  }

  async getChatHistory(
    userId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    try {
      // In a real implementation, retrieve from database
      // For now, return empty array as we're not persisting chat history
      return [];
    } catch (error) {
      this.logger.error('Error retrieving chat history:', error);
      return [];
    }
  }

  async getHealthInsights(userId: string): Promise<string[]> {
    try {
      // Generate personalized health insights based on user's medical history
      // This would integrate with the user's health data from the platform
      return [
        'Remember to take your prescribed medications on time',
        'Your next appointment is scheduled for tomorrow at 2 PM',
        'Consider scheduling your annual health checkup',
        'Stay hydrated - aim for 8 glasses of water daily',
        'Regular exercise can help improve your overall health',
      ];
    } catch (error) {
      this.logger.error('Error generating health insights:', error);
      return [];
    }
  }
}
