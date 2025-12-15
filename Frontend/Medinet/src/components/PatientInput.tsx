import React, { useState } from 'react';
import { Send, Loader2, MapPin } from 'lucide-react';

interface PatientInputProps {
  onSendMessage: (message: string) => void;
  onShareLocation: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  locationRequested?: boolean;
}

export const PatientInput: React.FC<PatientInputProps> = ({
  onSendMessage,
  onShareLocation,
  isLoading,
  isDisabled,
  locationRequested,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {locationRequested && (
        <button
          type="button"
          onClick={onShareLocation}
          disabled={isLoading || isDisabled}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <MapPin className="w-4 h-4" />
          Share Location
        </button>
      )}

      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={isLoading || isDisabled}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-20"
          rows={2}
        />

        <button
          type="submit"
          disabled={!message.trim() || isLoading || isDisabled}
          className="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};
