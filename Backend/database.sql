CREATE DATABASE IF NOT EXISTS myproject;
USE myproject;

-- Patient Table
CREATE TABLE Patient (
    Patient_ID CHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Table
CREATE TABLE Doctor (
    Doctor_ID CHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    experience_years INT,
    availability_status ENUM('Available', 'Busy', 'Offline') DEFAULT 'Available',
    clinic_address TEXT,
    clinic_latitude DECIMAL(10, 8),
    clinic_longitude DECIMAL(11, 8),
    whatsapp_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Specialties Reference
CREATE TABLE Specialty (
    Specialty_ID CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultation Sessions
CREATE TABLE Consultation (
    Consultation_ID CHAR(36) PRIMARY KEY,
    Patient_ID CHAR(36) NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP NULL,
    symptoms TEXT,
    predicted_diseases JSON,
    severity_score INT,
    specialty_recommended VARCHAR(100),
    status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE
);

-- Conversation Logs (for AI interaction tracking)
CREATE TABLE ConversationLog (
    Log_ID CHAR(36) PRIMARY KEY,
    Consultation_ID CHAR(36) NOT NULL,
    message_type ENUM('Patient', 'AI_Doctor', 'System') NOT NULL,
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (Consultation_ID) REFERENCES Consultation(Consultation_ID) ON DELETE CASCADE
);

-- Appointments
CREATE TABLE Appointment (
    Appointment_ID CHAR(36) PRIMARY KEY,
    Consultation_ID CHAR(36) NOT NULL,
    Patient_ID CHAR(36) NOT NULL,
    Doctor_ID CHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    severity_priority INT NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled') DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Consultation_ID) REFERENCES Consultation(Consultation_ID) ON DELETE CASCADE,
    FOREIGN KEY (Patient_ID) REFERENCES Patient(Patient_ID) ON DELETE CASCADE,
    FOREIGN KEY (Doctor_ID) REFERENCES Doctor(Doctor_ID) ON DELETE CASCADE
);

-- Diagnosis Results
CREATE TABLE Diagnosis (
    Diagnosis_ID CHAR(36) PRIMARY KEY,
    Consultation_ID CHAR(36) NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    confidence_score DECIMAL(5,2),
    severity_level ENUM('Low', 'Medium', 'High', 'Critical'),
    recommended_actions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Consultation_ID) REFERENCES Consultation(Consultation_ID) ON DELETE CASCADE
);

-- Insert sample specialties
INSERT INTO Specialty (Specialty_ID, name, description) VALUES
(UUID(), 'General Medicine', 'General health conditions and primary care'),
(UUID(), 'Cardiology', 'Heart and cardiovascular system'),
(UUID(), 'Dermatology', 'Skin, hair, and nail conditions'),
(UUID(), 'Orthopedics', 'Bones, joints, and musculoskeletal system'),
(UUID(), 'Neurology', 'Brain and nervous system disorders'),
(UUID(), 'Gastroenterology', 'Digestive system and related organs'),
(UUID(), 'Pulmonology', 'Respiratory system and lungs'),
(UUID(), 'Pediatrics', 'Children health and development'),
(UUID(), 'Psychiatry', 'Mental health and behavioral disorders'),
(UUID(), 'ENT', 'Ear, nose, and throat conditions');
