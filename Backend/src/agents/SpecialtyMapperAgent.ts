// Specialty Mapper Agent - Maps diseases to medical specialties
import { callGemini, SYSTEM_PROMPTS, DISEASE_SPECIALTY_MAP } from '../config/llm-config.js';
import type { Disease } from '../types/index.js';

export class SpecialtyMapperAgent {
  /**
   * Map diseases to appropriate medical specialty
   */
  async mapToSpecialty(diseases: Disease[]): Promise<string> {
    if (diseases.length === 0) {
      return 'General Medicine';
    }

    // Try rule-based mapping first (fast)
    const ruleBasedSpecialty = this.ruleBasedMapping(diseases);
    if (ruleBasedSpecialty !== 'General Medicine') {
      return ruleBasedSpecialty;
    }

    // Fall back to LLM for complex cases
    try {
      const diseaseNames = diseases.map(d => d.name).join(', ');
      
      const prompt = `Map these diseases to the most appropriate medical specialty: ${diseaseNames}
      
Only respond with the specialty name, nothing else.`;

      const specialty = await callGemini(prompt, SYSTEM_PROMPTS.SPECIALTY_MAPPER);
      
      // Validate specialty
      return this.validateSpecialty(specialty.trim());
    } catch (error) {
      console.error('SpecialtyMapperAgent Error:', error);
      return 'General Medicine';
    }
  }

  /**
   * Rule-based mapping using keyword matching
   */
  private ruleBasedMapping(diseases: Disease[]): string {
    // Use the disease with highest confidence
    const primaryDisease = diseases.sort((a, b) => b.confidence - a.confidence)[0];
    
    const diseaseLower = primaryDisease.name.toLowerCase();
    
    // Check against mapping database
    for (const [keyword, specialty] of Object.entries(DISEASE_SPECIALTY_MAP)) {
      if (diseaseLower.includes(keyword)) {
        return specialty;
      }
    }

    return 'General Medicine';
  }

  /**
   * Validate specialty against known specialties
   */
  private validateSpecialty(specialty: string): string {
    const validSpecialties = [
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Orthopedics',
      'Neurology',
      'Gastroenterology',
      'Pulmonology',
      'Pediatrics',
      'Psychiatry',
      'ENT',
    ];

    // Check if specialty matches (case-insensitive)
    const matched = validSpecialties.find(
      valid => valid.toLowerCase() === specialty.toLowerCase()
    );

    return matched || 'General Medicine';
  }

  /**
   * Get specialty description
   */
  getSpecialtyDescription(specialty: string): string {
    const descriptions: Record<string, string> = {
      'General Medicine': 'Handles common health conditions and provides primary care',
      'Cardiology': 'Specializes in heart and cardiovascular conditions',
      'Dermatology': 'Focuses on skin, hair, and nail disorders',
      'Orthopedics': 'Treats bone, joint, and musculoskeletal issues',
      'Neurology': 'Deals with brain, spine, and nervous system disorders',
      'Gastroenterology': 'Specializes in digestive system and related organs',
      'Pulmonology': 'Focuses on respiratory system and lung conditions',
      'Pediatrics': 'Specialized care for infants, children, and adolescents',
      'Psychiatry': 'Addresses mental health and behavioral disorders',
      'ENT': 'Treats ear, nose, and throat conditions',
    };

    return descriptions[specialty] || descriptions['General Medicine'];
  }
}
