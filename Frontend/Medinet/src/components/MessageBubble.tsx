import React from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import type { ChatMessage } from '../types/index.js';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isPatient = message.type === 'patient';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2 flex items-center gap-2 max-w-md">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isPatient ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex gap-2 max-w-xs md:max-w-md lg:max-w-lg ${
          isPatient ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {!isPatient && (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-2 break-words ${
            isPatient
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
          }`}
        >
          <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
          <span className={`text-xs mt-1 block ${isPatient ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
