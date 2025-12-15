-- Sample data for testing the Agentic AI Medical System

-- Insert sample doctors across different specialties with clinic locations
INSERT INTO Doctor (Doctor_ID, email, password, name, specialty, phone, experience_years, availability_status, clinic_address, clinic_latitude, clinic_longitude, whatsapp_number) VALUES
-- General Medicine
(UUID(), 'dr.patel@hospital.com', '$2b$10$examplehash1', 'Dr. Rajesh Patel', 'General Medicine', '+91-9876543210', 15, 'Available', 'Apollo Hospital, Greams Road, Chennai, Tamil Nadu 600006', 13.0569, 80.2497, '+91-9876543210'),
(UUID(), 'dr.sharma@hospital.com', '$2b$10$examplehash2', 'Dr. Priya Sharma', 'General Medicine', '+91-9876543211', 12, 'Available', 'Fortis Hospital, Bannerghatta Road, Bangalore, Karnataka 560076', 12.9016, 77.5969, '+91-9876543211'),

-- Cardiology
(UUID(), 'dr.kumar@hospital.com', '$2b$10$examplehash3', 'Dr. Amit Kumar', 'Cardiology', '+91-9876543212', 20, 'Available', 'Max Super Specialty Hospital, Saket, New Delhi 110017', 28.5245, 77.2066, '+91-9876543212'),
(UUID(), 'dr.singh@hospital.com', '$2b$10$examplehash4', 'Dr. Kavita Singh', 'Cardiology', '+91-9876543213', 18, 'Available', 'Medanta - The Medicity, Sector 38, Gurugram, Haryana 122001', 28.4404, 77.0506, '+91-9876543213'),

-- Dermatology
(UUID(), 'dr.mehta@hospital.com', '$2b$10$examplehash5', 'Dr. Rohan Mehta', 'Dermatology', '+91-9876543214', 10, 'Available', 'Kokilaben Dhirubhai Ambani Hospital, Andheri West, Mumbai 400053', 19.1334, 72.8266, '+91-9876543214'),

-- Orthopedics
(UUID(), 'dr.verma@hospital.com', '$2b$10$examplehash6', 'Dr. Sanjay Verma', 'Orthopedics', '+91-9876543215', 22, 'Available', 'Manipal Hospital, Old Airport Road, Bangalore 560017', 12.9539, 77.6574, '+91-9876543215'),
(UUID(), 'dr.gupta@hospital.com', '$2b$10$examplehash7', 'Dr. Anita Gupta', 'Orthopedics', '+91-9876543216', 14, 'Available', 'AIIMS, Ansari Nagar, New Delhi 110029', 28.5672, 77.2100, '+91-9876543216'),

-- Neurology
(UUID(), 'dr.reddy@hospital.com', '$2b$10$examplehash8', 'Dr. Srinivas Reddy', 'Neurology', '+91-9876543217', 25, 'Available', 'Yashoda Hospitals, Somajiguda, Hyderabad 500082', 17.4308, 78.4559, '+91-9876543217'),

-- Gastroenterology
(UUID(), 'dr.desai@hospital.com', '$2b$10$examplehash9', 'Dr. Vikram Desai', 'Gastroenterology', '+91-9876543218', 16, 'Available', 'Ruby Hall Clinic, Pune, Maharashtra 411001', 18.5196, 73.8553, '+91-9876543218'),

-- Pulmonology
(UUID(), 'dr.rao@hospital.com', '$2b$10$examplehash10', 'Dr. Lakshmi Rao', 'Pulmonology', '+91-9876543219', 13, 'Available', 'Columbia Asia Hospital, Whitefield, Bangalore 560066', 12.9899, 77.7285, '+91-9876543219'),

-- Pediatrics
(UUID(), 'dr.nair@hospital.com', '$2b$10$examplehash11', 'Dr. Arun Nair', 'Pediatrics', '+91-9876543220', 17, 'Available', 'Rainbow Children Hospital, Banjara Hills, Hyderabad 500034', 17.4126, 78.4484, '+91-9876543220'),

-- Psychiatry
(UUID(), 'dr.iyer@hospital.com', '$2b$10$examplehash12', 'Dr. Meera Iyer', 'Psychiatry', '+91-9876543221', 19, 'Available', 'Cadabams Hospitals, Bangalore, Karnataka 560064', 13.0659, 77.5970, '+91-9876543221'),

-- ENT
(UUID(), 'dr.chopra@hospital.com', '$2b$10$examplehash13', 'Dr. Ashok Chopra', 'ENT', '+91-9876543222', 11, 'Available', 'BLK Super Specialty Hospital, Pusa Road, New Delhi 110005', 28.6448, 77.1859, '+91-9876543222');

-- Insert sample patients (passwords are 'password123' hashed with bcrypt)
INSERT INTO Patient (Patient_ID, email, password, name, phone, age, gender) VALUES
(UUID(), 'patient1@example.com', '$2b$10$examplehash14', 'Ravi Kumar', '+91-9876000001', 35, 'Male'),
(UUID(), 'patient2@example.com', '$2b$10$examplehash15', 'Anjali Sharma', '+91-9876000002', 28, 'Female'),
(UUID(), 'patient3@example.com', '$2b$10$examplehash16', 'Suresh Patel', '+91-9876000003', 45, 'Male'),
(UUID(), 'patient4@example.com', '$2b$10$examplehash17', 'Pooja Reddy', '+91-9876000004', 32, 'Female'),
(UUID(), 'patient5@example.com', '$2b$10$examplehash18', 'Karan Singh', '+91-9876000005', 22, 'Male');

-- Note: In production, use actual bcrypt hashed passwords
-- Example: await bcrypt.hash('password123', 10)
