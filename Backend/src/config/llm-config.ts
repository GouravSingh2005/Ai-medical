// Configuration for LLM and Agent System
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Generative AI (Gemini) Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Helper function to call Gemini API
export async function callGemini(prompt: string, systemPrompt: string = ''): Promise<string> {
  try {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const result = await geminiModel.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// System Prompts for Different Agents
export const SYSTEM_PROMPTS = {
  DOCTOR_AGENT: `You are an empathetic AI medical assistant conducting a preliminary consultation. 

Your SPECIFIC tasks:
1. Ask ONE clear, focused follow-up question at a time about:
   - Duration of symptoms (how long?)
   - Severity/intensity (mild, moderate, severe?)
   - Associated symptoms (anything else?)
   - Triggering factors (what makes it worse/better?)
   - Previous medical history (had this before?)
   
2. Be conversational and caring - show empathy
3. Keep questions simple and direct
4. DO NOT ask multiple questions at once
5. After 4-6 detailed exchanges with good symptom information, start your response with "DIAGNOSIS_READY"

Example good questions:
- "How long have you been experiencing these symptoms?"
- "On a scale of 1-10, how would you rate the severity?"
- "Have you noticed any other symptoms along with this?"

Remember: You're gathering information only, not diagnosing. Keep responses under 2 sentences.`,

  DIAGNOSIS_AGENT: `You are a medical AI that analyzes symptoms and predicts possible diseases. Given a list of symptoms, you must:
1. Identify 3-5 most likely diseases/conditions
2. Assign a confidence score (0-100) for each disease
3. Calculate an overall severity score (0-100) based on symptom urgency
4. Categorize urgency as: low, medium, high, or critical

Format your response as JSON:
{
  "diseases": [{"name": "Disease Name", "confidence": 85, "severity": 60, "description": "Brief explanation"}],
  "overallSeverity": 65,
  "urgencyLevel": "medium",
  "recommendedActions": ["Action 1", "Action 2"]
}

Base your analysis on medical knowledge but always note this is preliminary screening, not a diagnosis.`,

  SPECIALTY_MAPPER: `You are a medical specialty classifier. Given diseases, map them to appropriate medical specialties:
- General Medicine: Common conditions, fever, infections
- Cardiology: Heart, blood pressure, chest pain
- Dermatology: Skin, rashes, allergies
- Orthopedics: Bones, joints, fractures
- Neurology: Headaches, seizures, nerve issues
- Gastroenterology: Digestive issues, stomach pain
- Pulmonology: Breathing, cough, lungs
- Psychiatry: Mental health, anxiety, depression
- ENT: Ear, nose, throat issues
- Pediatrics: Children-specific conditions

Return only the specialty name.`,
};

// Disease-Specialty Mapping Database
export const DISEASE_SPECIALTY_MAP: Record<string, string> = {
  // Cardiology
  'hypertension': 'Cardiology',
  'heart attack': 'Cardiology',
  'arrhythmia': 'Cardiology',
  'chest pain': 'Cardiology',
  'coronary artery disease': 'Cardiology',
  
  // Dermatology
  'eczema': 'Dermatology',
  'psoriasis': 'Dermatology',
  'acne': 'Dermatology',
  'skin rash': 'Dermatology',
  'allergic reaction': 'Dermatology',
  
  // Orthopedics
  'fracture': 'Orthopedics',
  'arthritis': 'Orthopedics',
  'back pain': 'Orthopedics',
  'joint pain': 'Orthopedics',
  'sprain': 'Orthopedics',
  
  // Neurology
  'migraine': 'Neurology',
  'seizure': 'Neurology',
  'stroke': 'Neurology',
  'headache': 'Neurology',
  'neuropathy': 'Neurology',
  
  // Gastroenterology
  'gastritis': 'Gastroenterology',
  'ibs': 'Gastroenterology',
  'ulcer': 'Gastroenterology',
  'constipation': 'Gastroenterology',
  'diarrhea': 'Gastroenterology',
  
  // Pulmonology
  'asthma': 'Pulmonology',
  'copd': 'Pulmonology',
  'pneumonia': 'Pulmonology',
  'bronchitis': 'Pulmonology',
  'respiratory infection': 'Pulmonology',
  
  // Psychiatry
  'depression': 'Psychiatry',
  'anxiety': 'Psychiatry',
  'panic attack': 'Psychiatry',
  'insomnia': 'Psychiatry',
  'bipolar disorder': 'Psychiatry',
  
  // ENT
  'sinusitis': 'ENT',
  'ear infection': 'ENT',
  'tonsillitis': 'ENT',
  'hearing loss': 'ENT',
  'vertigo': 'ENT',
  
  // Default
  'fever': 'General Medicine',
  'common cold': 'General Medicine',
  'flu': 'General Medicine',
  'fatigue': 'General Medicine',
};

// Agent Configuration
export const AGENT_CONFIG = {
  MAX_QUESTIONS: 6,
  MIN_QUESTIONS: 3,
  TIMEOUT_MS: 300000, // 5 minutes
  SEVERITY_THRESHOLDS: {
    LOW: 30,
    MEDIUM: 50,
    HIGH: 70,
    CRITICAL: 85,
  },
  BOOKING_PRIORITY: {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  },
};
