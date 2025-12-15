// Doctor Agent - Handles patient interaction and symptom gathering using LLM
import { callGemini, SYSTEM_PROMPTS, AGENT_CONFIG } from '../config/llm-config.js';
import type { Message, ConsultationSession, Symptom } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class DoctorAgent {
  private questionCount: number = 0;
  
  /**
   * Initialize conversation with greeting
   */
  async startConsultation(patientName?: string): Promise<string> {
    const greeting = `Hello${patientName ? ' ' + patientName : ''}! I'm your AI medical assistant. I'm here to help understand your health concerns and guide you to the right specialist.

Please describe your main symptoms or what's bothering you today.

⚠️ Note: This is a preliminary screening tool, not a substitute for professional medical advice.`;
    
    return greeting;
  }

  /**
   * Process patient response and generate follow-up question using LLM
   */
  async processPatientResponse(
    session: ConsultationSession,
    patientMessage: string
  ): Promise<{ message: string; isDiagnosisReady: boolean }> {
    this.questionCount++;

    // Add patient message to history
    session.conversationHistory.push({
      id: uuidv4(),
      type: 'patient',
      content: patientMessage,
      timestamp: new Date(),
    });

    try {
      // Build conversation context
      const conversationContext = session.conversationHistory
        .map(msg => `${msg.type === 'patient' ? 'Patient' : 'AI Doctor'}: ${msg.content}`)
        .join('\n');

      // Call Gemini API for intelligent follow-up
      const prompt = `You are conducting a medical consultation. Review the conversation and decide:
1. If you need more information, ask ONE specific follow-up question
2. If you have enough information (4+ exchanges with clear symptoms), respond with "DIAGNOSIS_READY" at the start

Current question count: ${this.questionCount}/${AGENT_CONFIG.MAX_QUESTIONS}

Conversation:
${conversationContext}

Your response (if ready for diagnosis, start with "DIAGNOSIS_READY"):`;

      const aiResponse = await callGemini(prompt, SYSTEM_PROMPTS.DOCTOR_AGENT);

      console.log(`\n${'─'.repeat(60)}`);
      console.log(`[DoctorAgent] 🤖 Question ${this.questionCount}/${AGENT_CONFIG.MAX_QUESTIONS}`);
      console.log(`Response Length: ${aiResponse.length} chars`);
      console.log(`Response Preview: ${aiResponse.substring(0, 100)}...`);
      console.log(`${'─'.repeat(60)}`);

      // Check if diagnosis is ready
      const hasDiagnosisMarker = aiResponse.trim().toUpperCase().startsWith('DIAGNOSIS_READY');
      const hasEnoughQuestions = this.questionCount >= AGENT_CONFIG.MIN_QUESTIONS;
      const reachedMaxQuestions = this.questionCount >= AGENT_CONFIG.MAX_QUESTIONS;

      const isDiagnosisReady = (hasDiagnosisMarker && hasEnoughQuestions) || reachedMaxQuestions;

      // Clean response - remove DIAGNOSIS_READY marker
      let cleanResponse = aiResponse.replace(/^DIAGNOSIS_READY[:\s]*/i, '').trim();

      // If reached max questions, add transition message
      if (reachedMaxQuestions && !hasDiagnosisMarker) {
        cleanResponse = "Thank you for providing detailed information. Let me analyze your symptoms now.";
      }

      console.log(`\n[DoctorAgent] 📊 Decision Points:`);
      console.log(`  ✓ Has DIAGNOSIS_READY marker: ${hasDiagnosisMarker}`);
      console.log(`  ✓ Min questions met (${AGENT_CONFIG.MIN_QUESTIONS}): ${hasEnoughQuestions}`);
      console.log(`  ✓ Max questions reached (${AGENT_CONFIG.MAX_QUESTIONS}): ${reachedMaxQuestions}`);
      console.log(`  ➜ DIAGNOSIS READY: ${isDiagnosisReady ? '✅ YES' : '❌ NO'}\n`);

      // Add AI response to history
      session.conversationHistory.push({
        id: uuidv4(),
        type: 'ai_doctor',
        content: cleanResponse,
        timestamp: new Date(),
      });

      return {
        message: cleanResponse,
        isDiagnosisReady,
      };
    } catch (error) {
      console.error('DoctorAgent Error:', error);
      
      // Fallback to rule-based questions if API fails
      const fallbackQuestion = this.getFallbackQuestion(this.questionCount);
      
      session.conversationHistory.push({
        id: uuidv4(),
        type: 'ai_doctor',
        content: fallbackQuestion,
        timestamp: new Date(),
      });

      const isDiagnosisReady = this.questionCount >= AGENT_CONFIG.MAX_QUESTIONS;

      return {
        message: fallbackQuestion,
        isDiagnosisReady,
      };
    }
  }

  /**
   * Fallback questions if API fails
   */
  private getFallbackQuestion(count: number): string {
    const fallbackQuestions = [
      "I understand. How long have you been experiencing these symptoms?",
      "On a scale of 1-10, how severe is your discomfort?",
      "Have you noticed any other symptoms along with this?",
      "Does anything make your symptoms better or worse?",
      "Have you had similar issues in the past?",
      "Thank you for sharing. Let me analyze this information.",
    ];
    
    return fallbackQuestions[Math.min(count - 1, fallbackQuestions.length - 1)];
  }

  /**
   * Extract symptoms from conversation history using AI
   */
  async extractSymptoms(conversationHistory: Message[]): Promise<Symptom[]> {
    const symptoms: Symptom[] = [];
    
    // Combine all patient messages
    const patientMessages = conversationHistory
      .filter(msg => msg.type === 'patient')
      .map(msg => msg.content)
      .join(' ');

    try {
      // Use AI to extract structured symptoms
      const extractionPrompt = `Extract all symptoms from the following patient statements. List each symptom with its details:

Patient statements:
${patientMessages}

Extract symptoms in this format (one per line):
- Symptom: [description], Duration: [if mentioned], Severity: [mild/moderate/severe if mentioned]`;

      const aiResponse = await callGemini(extractionPrompt, 'You are a medical symptom extractor. Extract clear, structured symptom information.');

      console.log('[DoctorAgent] Extracted symptoms:', aiResponse);

      // Parse AI response and create symptom objects
      symptoms.push({
        description: patientMessages,
      });

      return symptoms;
    } catch (error) {
      console.error('Symptom extraction error:', error);
      // Fallback: use simple extraction
      symptoms.push({
        description: patientMessages,
      });
      return symptoms;
    }
  }

  /**
   * Reset question counter for new consultation
   */
  reset() {
    this.questionCount = 0;
  }
}
