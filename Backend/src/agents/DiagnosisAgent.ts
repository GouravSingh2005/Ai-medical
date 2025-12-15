// Diagnosis Agent - Analyzes symptoms and predicts diseases using LLM
import { callGemini, SYSTEM_PROMPTS, AGENT_CONFIG } from '../config/llm-config.js';
import type { DiagnosisResult, Disease, Message } from '../types/index.js';

export class DiagnosisAgent {
  /**
   * Analyze symptoms and generate diagnosis using LLM
   */
  async analyzeSymptomsAndDiagnose(
    conversationHistory: Message[]
  ): Promise<DiagnosisResult> {
    try {
      // Extract symptom text from conversation
      const symptomText = this.extractSymptomText(conversationHistory);

      // Call Gemini API for diagnosis
      const prompt = `Analyze these symptoms and provide a diagnosis in JSON format:

Symptoms: ${symptomText}

Respond with JSON in this format:
{
  "diseases": [{"name": "Disease Name", "confidence": 85, "severity": 60, "description": "Brief explanation"}],
  "overallSeverity": 65,
  "urgencyLevel": "medium",
  "recommendedActions": ["Action 1", "Action 2"]
}`;

      const diagnosisResponse = await callGemini(prompt, SYSTEM_PROMPTS.DIAGNOSIS_AGENT);
      
      console.log('[DiagnosisAgent] Gemini Response:', diagnosisResponse.substring(0, 200) + '...');
      
      // Parse JSON response
      let diagnosisData;
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = diagnosisResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('[DiagnosisAgent] No JSON found in response');
          throw new Error('No JSON in response');
        }
        diagnosisData = JSON.parse(jsonMatch[0]);
        console.log('[DiagnosisAgent] Parsed diseases:', diagnosisData.diseases?.length || 0);
      } catch (error) {
        console.error('[DiagnosisAgent] JSON parse error:', error);
        diagnosisData = {};
      }

      // Map to our format
      const diseases: Disease[] = (diagnosisData.diseases || []).map((d: any) => ({
        name: d.name,
        confidence: d.confidence || 50,
        severity: d.severity || 50,
        description: d.description,
      }));

      // Calculate severity score
      const severityScore = diagnosisData.overallSeverity || this.calculateSeverityScore(diseases);
      
      // Determine urgency level
      const urgencyLevel = this.determineUrgencyLevel(severityScore);

      return {
        diseases,
        severityScore,
        recommendedSpecialty: '', // Will be filled by SpecialtyMapper
        recommendedActions: diagnosisData.recommendedActions || [
          'Consult with a medical professional',
          'Monitor your symptoms',
        ],
        urgencyLevel,
      };
    } catch (error) {
      console.error('DiagnosisAgent Error:', error);
      
      // Fallback diagnosis
      return this.getFallbackDiagnosis();
    }
  }

  /**
   * Extract symptom text from conversation - focus on patient messages
   */
  private extractSymptomText(conversationHistory: Message[]): string {
    // Get all patient responses
    const patientMessages = conversationHistory
      .filter(msg => msg.type === 'patient')
      .map(msg => msg.content)
      .join(' | ');
    
    // Also include context from conversation
    const fullConversation = conversationHistory
      .map(msg => `${msg.type === 'patient' ? 'Patient' : 'Doctor'}: ${msg.content}`)
      .join('\n');
    
    return `Patient Symptoms Summary: ${patientMessages}\n\nFull Conversation Context:\n${fullConversation}`;
  }

  /**
   * Calculate severity score from diseases
   */
  private calculateSeverityScore(diseases: Disease[]): number {
    if (diseases.length === 0) return 50;
    
    // Average severity weighted by confidence
    const totalWeight = diseases.reduce((sum, d) => sum + d.confidence, 0);
    const weightedSeverity = diseases.reduce(
      (sum, d) => sum + (d.severity * d.confidence),
      0
    );
    
    return Math.round(weightedSeverity / totalWeight);
  }

  /**
   * Determine urgency level based on severity score
   */
  private determineUrgencyLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= AGENT_CONFIG.SEVERITY_THRESHOLDS.CRITICAL) return 'critical';
    if (score >= AGENT_CONFIG.SEVERITY_THRESHOLDS.HIGH) return 'high';
    if (score >= AGENT_CONFIG.SEVERITY_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  /**
   * Fallback diagnosis if API fails
   */
  private getFallbackDiagnosis(): DiagnosisResult {
    return {
      diseases: [
        {
          name: 'Common Viral Infection',
          confidence: 60,
          severity: 40,
          description: 'Based on general symptoms',
        },
      ],
      severityScore: 40,
      recommendedSpecialty: 'General Medicine',
      recommendedActions: [
        'Rest and stay hydrated',
        'Monitor symptoms',
        'Consult a doctor if symptoms worsen',
      ],
      urgencyLevel: 'low',
    };
  }

  /**
   * Generate patient-friendly summary
   */
  generateSummary(diagnosis: DiagnosisResult): string {
    const topDisease = diagnosis.diseases[0];
    
    return `Based on our conversation, the most likely condition is **${topDisease.name}** (${topDisease.confidence}% confidence).

**Severity Level**: ${diagnosis.urgencyLevel.toUpperCase()}
**Recommended Specialty**: ${diagnosis.recommendedSpecialty}

**Recommended Actions**:
${diagnosis.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

⚠️ **Important**: This is an AI-generated preliminary assessment, not a medical diagnosis. Please consult with a healthcare professional for accurate diagnosis and treatment.`;
  }
}
