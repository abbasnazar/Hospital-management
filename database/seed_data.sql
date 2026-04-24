-- =============================================================================
-- HMIS — MySQL seed data (DEV ONLY).
-- Password for every seeded user is literally: password
-- Hash below is bcrypt($2a$10$...) of "password"
-- =============================================================================

USE hmis;

-- Roles ----------------------------------------------------------------------
INSERT INTO auth_role (code, description) VALUES
  ('ADMIN',        'System administrator'),
  ('DOCTOR',       'Licensed medical practitioner'),
  ('NURSE',        'Registered nurse'),
  ('LAB_TECH',     'Laboratory technician'),
  ('PHARMACIST',   'Licensed pharmacist'),
  ('RECEPTIONIST', 'Front-desk / registration'),
  ('PATIENT',      'Self-service patient portal')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Users ----------------------------------------------------------------------
INSERT INTO auth_user (username, email, password_hash, status) VALUES
  ('admin',  'admin@hmis.local',  '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE'),
  ('drrao',  'rao@hmis.local',    '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE'),
  ('kiran',  'kiran@hmis.local',  '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE'),
  ('priya',  'priya@hmis.local',  '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE'),
  ('rakesh', 'rakesh@hmis.local', '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE'),
  ('sara',   'sara@hmis.local',   '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE'),
  ('meera',  'meera@hmis.local',  '$2a$10$ukfbTFakT2xVbr3aP80Vt.Nu7ewjJKcqhRXpZxzscLG.aYWJ2Neeq', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Role assignments -----------------------------------------------------------
INSERT IGNORE INTO auth_user_role (user_id, role_id)
SELECT u.id, r.id
FROM auth_user u
JOIN auth_role r ON
  (u.username='admin'  AND r.code='ADMIN')        OR
  (u.username='drrao'  AND r.code='DOCTOR')       OR
  (u.username='kiran'  AND r.code='NURSE')        OR
  (u.username='priya'  AND r.code='RECEPTIONIST') OR
  (u.username='rakesh' AND r.code='LAB_TECH')     OR
  (u.username='sara'   AND r.code='PHARMACIST')   OR
  (u.username='meera'  AND r.code='PATIENT');

-- Patients -------------------------------------------------------------------
INSERT INTO patient_patient (mrn, first_name, last_name, dob, gender, phone, email, blood_group) VALUES
  ('MRN000001','Meera','Iyer',   '1992-03-15','F','+919812345001','meera@hmis.local','O+'),
  ('MRN000002','Rohit','Sharma', '1985-11-02','M','+919812345002','rohit@example.com','A+'),
  ('MRN000003','Aarav','Khan',   '2018-07-20','M','+919812345003',NULL,'B+')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Lab catalogue --------------------------------------------------------------
INSERT INTO lab_test (code, name, specimen, loinc, price) VALUES
  ('CBC','Complete Blood Count','WHOLE_BLOOD','57021-8',250.00),
  ('LFT','Liver Function Test','SERUM','24325-3',600.00),
  ('RFT','Renal Function Test','SERUM','24356-8',550.00),
  ('HB', 'Hemoglobin','WHOLE_BLOOD','718-7',120.00)
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Pharmacy masters -----------------------------------------------------------
INSERT INTO pharmacy_medicine (sku, name, strength, form, unit_price, reorder_level) VALUES
  ('PCM500',  'Paracetamol',   '500mg',  'TAB',  2.50, 100),
  ('AMX500',  'Amoxicillin',   '500mg',  'CAP',  6.75, 50),
  ('ORS200',  'ORS Sachet',    '20.5g',  'POW',  18.00, 80)
ON DUPLICATE KEY UPDATE unit_price = VALUES(unit_price);

INSERT INTO pharmacy_batch (medicine_id, batch_no, expiry_date, qty_on_hand, cost_price)
SELECT m.id, 'B-2026-01', '2027-06-30', 500, 1.80
FROM pharmacy_medicine m WHERE m.sku='PCM500'
ON DUPLICATE KEY UPDATE qty_on_hand = VALUES(qty_on_hand);

INSERT INTO pharmacy_batch (medicine_id, batch_no, expiry_date, qty_on_hand, cost_price)
SELECT m.id, 'B-2026-02', '2026-12-31', 200, 4.50
FROM pharmacy_medicine m WHERE m.sku='AMX500'
ON DUPLICATE KEY UPDATE qty_on_hand = VALUES(qty_on_hand);

-- Appointments ---------------------------------------------------------------
INSERT INTO patient_appointment (patient_id, doctor_id, slot_start, slot_end, status, reason)
SELECT p.id, 2, TIMESTAMPADD(DAY, 1, CURRENT_TIMESTAMP), TIMESTAMPADD(MINUTE, 20, TIMESTAMPADD(DAY, 1, CURRENT_TIMESTAMP)), 'BOOKED', 'Follow-up'
FROM patient_patient p WHERE p.mrn='MRN000002';

-- Reporting seed -------------------------------------------------------------
INSERT INTO reporting_daily_mis (report_date, site, opd_count, lab_orders, rx_dispensed, revenue_gross, revenue_net) VALUES
  (CURRENT_DATE, 'MAIN', 120, 45, 78, 185000.00, 172500.00)
ON DUPLICATE KEY UPDATE opd_count = VALUES(opd_count);
