import React from 'react';
import { Calendar, Clock, User, CheckCircle, MapPin, Phone } from 'lucide-react';
import type { Appointment } from '../types/index.js';

interface BookingConfirmationProps {
  appointment: Appointment;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorPhone?: string;
  distance?: string;
  travelTime?: string;
  navigationUrl?: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  doctorName,
  doctorSpecialty,
  doctorPhone,
  distance,
  travelTime,
  navigationUrl,
}) => {
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
    if (priority <= 2) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
    if (priority <= 3) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
    return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 1) return 'URGENT';
    if (priority <= 2) return 'HIGH PRIORITY';
    if (priority <= 3) return 'MEDIUM PRIORITY';
    return 'STANDARD';
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-blue-800">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Appointment Confirmed</h3>
      </div>

      {/* Doctor Info */}
      {doctorName && (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Assigned Doctor</p>
              <p className="font-semibold text-gray-900 dark:text-white">{doctorName}</p>
              {doctorSpecialty && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{doctorSpecialty}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Date</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{appointment.time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Badge */}
      <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${getPriorityColor(appointment.severityPriority)}`}>
        {getPriorityLabel(appointment.severityPriority)}
      </div>

      {/* Location Info */}
      {(distance || travelTime) && (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Clinic Location</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {distance && (
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    📍 {distance}
                  </p>
                )}
                {travelTime && (
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    ⏱️ {travelTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {navigationUrl && (
            <a
              href={navigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition text-center"
            >
              🗺️ Open Navigation
            </a>
          )}
        </div>
      )}

      {/* Contact Info */}
      {doctorPhone && (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg flex items-start gap-2">
          <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400">Contact</p>
            <a href={`tel:${doctorPhone}`} className="font-semibold text-purple-600 dark:text-purple-400 text-sm hover:underline">
              {doctorPhone}
            </a>
          </div>
        </div>
      )}

      {/* Appointment ID */}
      <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Appointment ID: <code className="font-mono text-gray-700 dark:text-gray-300">{appointment.appointmentId}</code>
        </p>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-900 dark:text-blue-100">
        ℹ️ Please arrive 10-15 minutes early. Bring any relevant medical records or test reports.
      </div>
    </div>
  );
};
