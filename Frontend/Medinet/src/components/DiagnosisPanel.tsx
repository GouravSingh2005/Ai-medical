import React from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import type { DiagnosisResult } from '../types/index.js';

interface DiagnosisPanelProps {
  diagnosis: DiagnosisResult;
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100';
    case 'high':
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100';
    case 'medium':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100';
    case 'low':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100';
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  }
};

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case 'critical':
    case 'high':
      return <AlertTriangle className="w-5 h-5" />;
    case 'medium':
      return <Activity className="w-5 h-5" />;
    case 'low':
      return <CheckCircle className="w-5 h-5" />;
    default:
      return <TrendingUp className="w-5 h-5" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
  if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
  return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
};

export const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({ diagnosis }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Urgency Badge */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${getUrgencyColor(diagnosis.urgencyLevel)}`}>
        {getUrgencyIcon(diagnosis.urgencyLevel)}
        <div>
          <p className="font-semibold uppercase text-sm">{diagnosis.urgencyLevel} Priority</p>
          <p className="text-xs opacity-75">Severity Score: {diagnosis.severityScore}/100</p>
        </div>
      </div>

      {/* Specialty Recommendation */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Recommended Specialty</p>
        <p className="font-semibold text-blue-900 dark:text-blue-100">{diagnosis.recommendedSpecialty}</p>
      </div>

      {/* Diseases */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Possible Conditions</h4>
        <div className="space-y-2">
          {diagnosis.diseases.map((disease, idx) => (
            <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{disease.name}</p>
                <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getConfidenceColor(disease.confidence)}`}>
                  {disease.confidence}% match
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${disease.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Severity: {disease.severity}%</span>
              </div>
              {disease.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{disease.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      {diagnosis.recommendedActions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Actions</h4>
          <ul className="space-y-1">
            {diagnosis.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{idx + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          ⚠️ <strong>Important:</strong> This is an AI-generated assessment. Please consult with a qualified healthcare professional for final diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};
