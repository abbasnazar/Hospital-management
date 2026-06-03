-- =============================================================================
-- HMIS — MySQL seed data (DEV ONLY).
-- Password for every seeded user is literally: password
-- Hash below is bcrypt($2a$10$...) of "password"
-- =============================================================================

USE hmis;

-- Roles (system roles) -------------------------------------------------------
INSERT INTO auth_role (code, description) VALUES
  ('SUPERADMIN',   'Super administrator - manages all orgs/admins/users'),
  ('ADMIN',        'Organization administrator'),
  ('DOCTOR',       'Licensed medical practitioner'),
  ('NURSE',        'Registered nurse'),
  ('LAB_TECH',     'Laboratory technician'),
  ('PHARMACIST',   'Licensed pharmacist'),
  ('RECEPTIONIST', 'Front-desk / registration'),
  ('PATIENT',      'Self-service patient portal'),
  ('PHYSIOTHERAPIST', 'Physiotherapy specialist'),
  ('RADIOLOGIST',  'Radiology specialist / diagnostician'),
  ('HR_OFFICER',   'Human Resources manager'),
  ('ENGINEER',     'Biomedical / facilities engineer'),
  ('QUALITY_OFFICER', 'Quality and compliance officer')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Users (including superadmin) -----------------------------------------------
INSERT INTO auth_user (username, email, password_hash, status) VALUES
  ('superadmin', 'superadmin@hmis.local', '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('admin',  'admin@hmis.local',  '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('drrao',  'rao@hmis.local',    '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('kiran',  'kiran@hmis.local',  '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('priya',  'priya@hmis.local',  '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('rakesh', 'rakesh@hmis.local', '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('sara',   'sara@hmis.local',   '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('meera',  'meera@hmis.local',  '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('amit',   'amit@hmis.local',   '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('deepak', 'deepak@hmis.local', '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('rajesh', 'rajesh@hmis.local', '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('arun',   'arun@hmis.local',   '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE'),
  ('neha',   'neha@hmis.local',   '$2a$10$tW6J4vQfeWZqLTNKg2DbZeGSE.pKzIar4ADlsRRsLtcs5Ywyjr4AG', 'ACTIVE')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Organization (default: City General Hospital) --------------------------------
INSERT INTO auth_organization (name, category, created_by, status) VALUES
  ('City General Hospital', 'Hospital', 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Set org_id for all users (admin + 12 demo users linked to the org)
UPDATE auth_user SET org_id = (SELECT id FROM auth_organization WHERE name='City General Hospital') WHERE username IN ('admin', 'drrao', 'kiran', 'priya', 'rakesh', 'sara', 'meera', 'amit', 'deepak', 'rajesh', 'arun', 'neha');

-- System role assignments (for superadmin, admin, and demo users) --------------------------
INSERT IGNORE INTO auth_user_role (user_id, role_id)
SELECT u.id, r.id
FROM auth_user u
JOIN auth_role r ON
  (u.username='superadmin' AND r.code='SUPERADMIN') OR
  (u.username='admin'      AND r.code='ADMIN')      OR
  (u.username='drrao'      AND r.code='DOCTOR')     OR
  (u.username='kiran'      AND r.code='NURSE')      OR
  (u.username='priya'      AND r.code='RECEPTIONIST') OR
  (u.username='rakesh'     AND r.code='LAB_TECH')   OR
  (u.username='sara'       AND r.code='PHARMACIST') OR
  (u.username='meera'      AND r.code='PATIENT')     OR
  (u.username='amit'       AND r.code='PHYSIOTHERAPIST') OR
  (u.username='deepak'     AND r.code='RADIOLOGIST')     OR
  (u.username='rajesh'     AND r.code='HR_OFFICER')      OR
  (u.username='arun'       AND r.code='ENGINEER')        OR
  (u.username='neha'       AND r.code='QUALITY_OFFICER');

-- Functionalities (30 features including new services) ------------------------------------------
INSERT INTO auth_functionality (code, label, module, description) VALUES
  ('dashboard.view',           'View Dashboard',            'Dashboard',         'Access the main dashboard'),
  ('patients.view',            'View Patients',             'Patients',          'List and search patients'),
  ('patients.create',          'Register Patient',          'Patients',          'Create new patient record'),
  ('appointments.view',        'View Appointments',         'Appointments',      'List and view appointments'),
  ('appointments.create',      'Book Appointment',          'Appointments',      'Create new appointment'),
  ('lab.view',                 'View Lab Orders',           'Lab',               'List lab orders'),
  ('lab.orders.create',        'Create Lab Order',          'Lab',               'Create new lab order'),
  ('lab.results.enter',        'Enter Lab Results',         'Lab',               'Record lab test results'),
  ('pharmacy.view',            'View Pharmacy',             'Pharmacy',          'View pharmacy operations'),
  ('pharmacy.dispense',        'Dispense Medicines',        'Pharmacy',          'Dispense medicines'),
  ('pharmacy.medicines',       'Manage Medicine Stock',     'Pharmacy',          'Manage medicines and batches'),
  ('billing.view',             'View Billing',              'Billing',           'View billing and invoices'),
  ('billing.create',           'Create Invoice',            'Billing',           'Create new invoice'),
  ('reports.view',             'View Reports',              'Reports',           'Access MIS and revenue reports'),
  ('admin.users',              'Manage Users',              'Admin',             'Create and manage users'),
  ('clinical.notes',           'Write Clinical Notes',      'Clinical',          'Create and edit clinical notes'),
  ('clinical.diagnosis',       'Record Diagnosis',          'Clinical',          'Record patient diagnoses'),
  ('clinical.discharge',       'Discharge Summary',         'Clinical',          'Create discharge summaries'),
  ('prescription.create',      'Create Prescription',       'Prescription',      'Create and manage prescriptions'),
  ('prescription.view',        'View Prescriptions',        'Prescription',      'View patient prescriptions'),
  ('prescription.approve',     'Approve Prescription',      'Prescription',      'Sign and approve prescriptions'),
  ('medical_records.view',        'View Medical Records',          'Medical Records',   'Access complete patient history'),
  ('medical_records.allergies',    'Manage Allergies',              'Medical Records',   'Add and manage patient allergies'),
  ('medical_records.documents',    'Upload Documents',              'Medical Records',   'Upload medical documents'),
  ('medical_records.medications',  'View Medications',              'Medical Records',   'View current and historical medications'),
  ('medical_records.diagnoses',    'View Diagnoses',                'Medical Records',   'View patient diagnoses'),
  ('medical_records.consultations','View Consultations',            'Medical Records',   'View consultation history'),
  ('clinical_support.interactions','Check Drug Interactions',       'Clinical Support',  'Check drug-drug interactions'),
  ('clinical_support.contraindications','Check Contraindications',  'Clinical Support',  'Check medicine contraindications'),
  ('clinical_support.dosage-guidelines','View Dosage Guidelines',    'Clinical Support',  'View dosage guidelines for special populations'),
  ('clinical_support.allergy-alert','Check Allergy Alerts',         'Clinical Support',  'Check medication allergy contraindications'),
  ('ipd.admissions',               'Manage Admissions',            'IPD',               'Create and manage patient admissions'),
  ('ipd.beds',                     'Assign Beds',                  'IPD',               'Assign beds to patients'),
  ('ipd.discharge',                'Discharge Patients',           'IPD',               'Discharge in-patients'),
  ('ipd.wards',                    'View Wards',                   'IPD',               'View ward and census status'),
  ('notifications.messages',       'Send Messages',                'Notifications',     'Send messages to users'),
  ('notifications.reminders',      'Set Reminders',                'Notifications',     'Schedule appointment reminders'),
  ('notifications.user',           'View Notifications',           'Notifications',     'View personal notifications')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- Default permission groups (one per system role) -----------------------------
INSERT INTO perm_group (name, description, org_id, created_by, status) VALUES
  ('DOCTOR Group', 'Default permissions for doctor role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('NURSE Group', 'Default permissions for nurse role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('LAB_TECH Group', 'Default permissions for lab tech role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('PHARMACIST Group', 'Default permissions for pharmacist role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('RECEPTIONIST Group', 'Default permissions for receptionist role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('PATIENT Group', 'Default permissions for patient role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('ADMIN Group', 'Default permissions for admin role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('PHYSIOTHERAPIST Group', 'Default permissions for physiotherapist role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('RADIOLOGIST Group', 'Default permissions for radiologist role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('HR_OFFICER Group', 'Default permissions for HR officer role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('ENGINEER Group', 'Default permissions for biomedical engineer role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('QUALITY_OFFICER Group', 'Default permissions for quality officer role', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Assign functionalities to groups (Doctor gets: dashboard, patients view, appointments all, lab order create, pharmacy view, billing view, CLINICAL, PRESCRIPTION, MEDICAL_RECORDS, CLINICAL_SUPPORT, IPD, NOTIFICATIONS)
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='DOCTOR Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'patients.view', 'patients.create', 'appointments.view', 'appointments.create',
  'lab.view', 'lab.orders.create', 'pharmacy.view', 'billing.view',
  'clinical.notes', 'clinical.diagnosis', 'clinical.discharge',
  'prescription.create', 'prescription.view', 'prescription.approve',
  'medical_records.view', 'medical_records.allergies', 'medical_records.documents', 'medical_records.medications', 'medical_records.diagnoses', 'medical_records.consultations',
  'clinical_support.interactions', 'clinical_support.contraindications', 'clinical_support.dosage-guidelines', 'clinical_support.allergy-alert',
  'ipd.admissions', 'ipd.beds', 'ipd.discharge', 'ipd.wards',
  'notifications.messages', 'notifications.reminders', 'notifications.user'
);

-- Nurse gets: dashboard, patients, appointments, lab results, pharmacy view, clinical notes, medical records, notifications, IPD
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='NURSE Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'patients.view', 'patients.create', 'appointments.view', 'appointments.create',
  'lab.results.enter', 'pharmacy.view', 'clinical.notes', 'clinical.discharge',
  'medical_records.view', 'medical_records.allergies', 'medical_records.documents', 'medical_records.medications', 'medical_records.diagnoses',
  'ipd.admissions', 'ipd.beds', 'ipd.discharge', 'ipd.wards',
  'notifications.messages', 'notifications.reminders', 'notifications.user'
);

-- Lab Tech gets: dashboard, lab all
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='LAB_TECH Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'lab.view', 'lab.orders.create', 'lab.results.enter', 'notifications.messages');

-- Pharmacist gets: dashboard, pharmacy all, prescription view/approve, medical records, clinical support, notifications
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='PHARMACIST Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'pharmacy.view', 'pharmacy.dispense', 'pharmacy.medicines',
  'prescription.view', 'prescription.approve',
  'medical_records.view', 'medical_records.allergies', 'medical_records.medications',
  'clinical_support.interactions', 'clinical_support.contraindications', 'clinical_support.dosage-guidelines', 'clinical_support.allergy-alert',
  'notifications.messages', 'notifications.user'
);

-- Receptionist gets: dashboard, patients all, appointments, billing all, notifications
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='RECEPTIONIST Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'patients.view', 'patients.create', 'appointments.view', 'appointments.create',
  'billing.view', 'billing.create', 'notifications.messages'
);

-- Patient gets: dashboard, appointments, billing, medical_records view, notifications
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='PATIENT Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'appointments.view', 'appointments.create', 'billing.view',
  'medical_records.view', 'notifications.messages', 'notifications.reminders', 'notifications.user'
);

-- Admin gets: all
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='ADMIN Group' LIMIT 1), id FROM auth_functionality;

-- Default permission roles (matching system roles) ----------------------------
INSERT INTO perm_role (code, name, description, org_id, created_by, status) VALUES
  ('DOCTOR', 'Doctor', 'Licensed medical practitioner', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('NURSE', 'Nurse', 'Registered nurse', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('LAB_TECH', 'Lab Technician', 'Laboratory technician', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('PHARMACIST', 'Pharmacist', 'Licensed pharmacist', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('RECEPTIONIST', 'Receptionist', 'Front-desk / registration', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('PATIENT', 'Patient', 'Self-service patient', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('ADMIN', 'Admin', 'Organization administrator', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('PHYSIOTHERAPIST', 'Physiotherapist', 'Physiotherapy specialist', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('RADIOLOGIST', 'Radiologist', 'Radiology specialist / diagnostician', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('HR_OFFICER', 'HR Officer', 'Human Resources manager', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('ENGINEER', 'Engineer', 'Biomedical / facilities engineer', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE'),
  ('QUALITY_OFFICER', 'Quality Officer', 'Quality and compliance officer', (SELECT id FROM auth_organization LIMIT 1), 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Assign groups to permission roles
INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='DOCTOR' AND pg.name='DOCTOR Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='NURSE' AND pg.name='NURSE Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='LAB_TECH' AND pg.name='LAB_TECH Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='PHARMACIST' AND pg.name='PHARMACIST Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='RECEPTIONIST' AND pg.name='RECEPTIONIST Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='PATIENT' AND pg.name='PATIENT Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='ADMIN' AND pg.name='ADMIN Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='PHYSIOTHERAPIST' AND pg.name='PHYSIOTHERAPIST Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='RADIOLOGIST' AND pg.name='RADIOLOGIST Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='HR_OFFICER' AND pg.name='HR_OFFICER Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='ENGINEER' AND pg.name='ENGINEER Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

INSERT IGNORE INTO perm_role_group (role_id, group_id)
SELECT pr.id, pg.id FROM perm_role pr JOIN perm_group pg ON (pr.code='QUALITY_OFFICER' AND pg.name='QUALITY_OFFICER Group') WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1);

-- Assign demo users to their default permission roles
INSERT IGNORE INTO auth_user_perm_role (user_id, role_id)
SELECT u.id, pr.id FROM auth_user u, perm_role pr
WHERE pr.org_id = (SELECT id FROM auth_organization LIMIT 1)
AND ((u.username='drrao' AND pr.code='DOCTOR') OR
     (u.username='kiran' AND pr.code='NURSE') OR
     (u.username='rakesh' AND pr.code='LAB_TECH') OR
     (u.username='sara' AND pr.code='PHARMACIST') OR
     (u.username='priya' AND pr.code='RECEPTIONIST') OR
     (u.username='meera' AND pr.code='PATIENT') OR
     (u.username='admin' AND pr.code='ADMIN') OR
     (u.username='amit' AND pr.code='PHYSIOTHERAPIST') OR
     (u.username='deepak' AND pr.code='RADIOLOGIST') OR
     (u.username='rajesh' AND pr.code='HR_OFFICER') OR
     (u.username='arun' AND pr.code='ENGINEER') OR
     (u.username='neha' AND pr.code='QUALITY_OFFICER'));

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

-- =============================================================================
-- ENHANCEMENT RBAC: new functionalities for patient-flow & hospital operations
-- =============================================================================
INSERT INTO auth_functionality (code, label, module, description) VALUES
  ('triage.view',      'View Triage Queue', 'Triage',    'View patients awaiting triage'),
  ('triage.create',    'Record Triage',     'Triage',    'Record vitals and assign triage priority'),
  ('checkin.view',     'View Check-Ins',    'Check-In',  'View reception check-in desk'),
  ('checkin.manage',   'Manage Check-In',   'Check-In',  'Check in patients, issue tokens, set queue'),
  ('queue.manage',     'Manage Doctor Queue','Queue',    'Call next, skip, reassign, mark no-show'),
  ('emergency.manage', 'Manage Emergency',  'Emergency', 'Register and manage casualty/emergency cases'),
  ('transfer.manage',  'Manage Transfers',  'Transfer',  'Transfer patients between wards/ICU/OT'),
  ('icu.manage',       'Manage ICU',        'ICU',       'ICU dashboard and in/out transfers'),
  ('nursing.notes',    'Nursing Station',   'Nursing',   'Record vitals/medication, update bed status')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- Receptionist group += triage/check-in/queue/emergency
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='RECEPTIONIST Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'triage.view', 'triage.create', 'checkin.view', 'checkin.manage', 'queue.manage', 'emergency.manage'
);

-- Doctor group += triage view, queue, emergency, transfer, icu (admission/discharge already granted)
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='DOCTOR Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'triage.view', 'queue.manage', 'emergency.manage', 'transfer.manage', 'icu.manage'
);

-- Nurse group += nursing station, triage recording, icu (beds/wards already granted; NO diagnosis)
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='NURSE Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'nursing.notes', 'triage.create', 'triage.view', 'icu.manage', 'checkin.view'
);

-- Admin group gets everything (re-run to pick up new functionalities)
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='ADMIN Group' LIMIT 1), id FROM auth_functionality;

-- =============================================================================
-- ENHANCEMENT seed: wards & beds (for ICU/Ward dashboards) ---------------------
-- =============================================================================
INSERT INTO ipd_ward (name, total_beds, category, floor, active) VALUES
  ('ICU-1',          10, 'ICU',          '3', 1),
  ('HDU-1',           8, 'HDU',          '3', 1),
  ('General Ward A', 30, 'GENERAL',      '1', 1),
  ('Private Wing',    6, 'PRIVATE',      '2', 1),
  ('Semi-Private B',  10,'SEMI_PRIVATE', '2', 1)
ON DUPLICATE KEY UPDATE total_beds = VALUES(total_beds);

-- Create 5 beds per seeded ward (idempotent on uk_ward_bed)
INSERT IGNORE INTO ipd_bed (ward_id, bed_number, status, floor)
SELECT w.id, CONCAT(LEFT(w.category,3), '-', n.num), 'AVAILABLE', w.floor
FROM ipd_ward w
JOIN (SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) n
WHERE w.name IN ('ICU-1','HDU-1','General Ward A','Private Wing','Semi-Private B');

-- =============================================================================
-- PHASE A: 95 NEW FUNCTIONALITIES (organized by department)
-- =============================================================================

-- 1. Patient Management (12 new)
INSERT INTO auth_functionality (code, label, module, description) VALUES
  ('patients.update', 'Edit Patient Profile', 'Patients', 'Update demographics, contacts, and insurance on existing patient record'),
  ('patients.deactivate', 'Deactivate Patient Record', 'Patients', 'Mark a patient record as inactive or merged'),
  ('patients.consent.view', 'View Patient Consents', 'Patients', 'View all consent forms signed by a patient'),
  ('patients.consent.create', 'Record Patient Consent', 'Patients', 'Capture informed consent for procedures and treatment'),
  ('patients.consent.revoke', 'Revoke Patient Consent', 'Patients', 'Mark a previously granted consent as withdrawn'),
  ('patients.insurance.view', 'View Patient Insurance', 'Patients', 'View insurance / TPA panel details linked to a patient'),
  ('patients.insurance.manage', 'Manage Patient Insurance', 'Patients', 'Add, edit, or deactivate insurance panel for a patient'),
  ('patients.photo.upload', 'Upload Patient Photo', 'Patients', 'Upload a patient identification photograph for verification'),
  ('appointments.reschedule', 'Reschedule Appointment', 'Appointments', 'Move a booked appointment to a new slot'),
  ('appointments.cancel', 'Cancel Appointment', 'Appointments', 'Cancel an existing appointment with reason'),
  ('appointments.slots.manage', 'Manage Doctor Availability Slots', 'Appointments', 'Define and block doctor-specific time slots and break periods'),
  ('appointments.waitlist.manage', 'Manage Appointment Waitlist', 'Appointments', 'Add patients to a waitlist and auto-notify on cancellation'),

-- 2. Front Desk / OPD (9 new)
  ('opd.token.manage', 'Manage OPD Token Series', 'OPD', 'Configure department-wise token number series and reset daily counters'),
  ('opd.census.view', 'View OPD Census', 'OPD', 'Real-time count of patients in each OPD queue by department'),
  ('opd.fee.collect', 'Collect OPD Registration Fee', 'OPD', 'Record OPD consultation fee at front desk and link to billing'),
  ('opd.revisit.manage', 'Manage OPD Revisit', 'OPD', 'Mark a patient as a revisit/follow-up and waive or apply discounted fee'),
  ('visitor.pass.manage', 'Manage Visitor Passes', 'Front Desk', 'Issue, track, and invalidate visitor entry passes for in-patients'),
  ('feedback.collect', 'Collect Patient Feedback', 'Front Desk', 'Record patient satisfaction scores and comments post-visit'),
  ('feedback.view', 'View Patient Feedback Reports', 'Front Desk', 'Aggregate feedback scores and comments by department or doctor'),
  ('referral.outward.create', 'Create Outward Referral', 'OPD', 'Generate a formal referral letter to an external specialist or facility'),
  ('referral.inward.manage', 'Manage Inward Referrals', 'OPD', 'Register and track patients referred in from external facilities'),

-- 3. In-Patient / IPD (13 new)
  ('ipd.diet.view', 'View Diet Orders', 'IPD', 'View current diet plan and meal schedule for admitted patients'),
  ('ipd.diet.manage', 'Manage Diet Orders', 'IPD', 'Create, modify, or discontinue diet plans for admitted patients'),
  ('ipd.ot.schedule', 'Schedule Operation Theatre', 'OT', 'Book OT time slots, assign surgeon, anaesthetist, and scrub nurse'),
  ('ipd.ot.view', 'View OT Schedule', 'OT', 'View daily and weekly OT booking list and current utilization'),
  ('ipd.ot.notes', 'Record OT / Surgery Notes', 'OT', 'Capture pre-op checklist, intraoperative notes, and post-op instructions'),
  ('ipd.anaesthesia.record', 'Record Anaesthesia Notes', 'OT', 'Document anaesthesia type, drugs used, and intraoperative monitoring'),
  ('ipd.ot.consent', 'Manage OT Consent', 'OT', 'Capture surgical consent and mark pre-operative checklist complete'),
  ('ipd.birth.register', 'Register Birth', 'IPD', 'Record live/still-birth details and generate birth certificate data'),
  ('ipd.death.register', 'Register Death', 'IPD', 'Record in-patient death, cause, and generate death certificate data'),
  ('ipd.mlc.manage', 'Manage Medico-Legal Cases', 'IPD', 'Flag and document MLC cases, injuries, police reporting status'),
  ('ipd.discharge.request', 'Initiate Discharge Request', 'IPD', 'Doctor initiates the multi-step discharge clearance workflow'),
  ('ipd.discharge.approve', 'Approve Discharge Clearance', 'IPD', 'Billing/pharmacy staff mark their clearance in the discharge workflow'),
  ('ipd.census.view', 'View IPD Census', 'IPD', 'Real-time bed occupancy and admission counts across wards'),

-- 4. Laboratory (12 new)
  ('lab.tests.manage', 'Manage Lab Test Catalogue', 'Lab', 'Add, edit, or deactivate tests, set reference ranges and LOINC codes'),
  ('lab.results.verify', 'Verify / Authorise Lab Results', 'Lab', 'Senior technician performs second-level result authorisation before reporting'),
  ('lab.results.amend', 'Amend Lab Results', 'Lab', 'Correct a previously reported result with audit trail'),
  ('lab.sample.reject', 'Reject Lab Sample', 'Lab', 'Mark a collected sample as unfit and trigger re-collection'),
  ('lab.sample.track', 'Track Specimen Status', 'Lab', 'View real-time status of all samples from collection to reporting'),
  ('lab.external.manage', 'Manage External Lab Referrals', 'Lab', 'Send orders to external reference labs and capture returned results'),
  ('lab.panel.manage', 'Manage Lab Test Panels', 'Lab', 'Group individual tests into profiles/panels (e.g. LFT panel)'),
  ('lab.qc.log', 'Record Lab Quality Control', 'Lab', 'Log daily QC runs, control values, and flag out-of-range controls'),
  ('radiology.order.create', 'Create Radiology Order', 'Radiology', 'Order X-Ray, CT, MRI, USG, or other imaging studies'),
  ('radiology.order.view', 'View Radiology Orders', 'Radiology', 'View imaging order queue and patient-wise imaging history'),
  ('radiology.report.enter', 'Enter Radiology Report', 'Radiology', 'Radiologist enters findings and impression for an imaging study'),
  ('radiology.image.upload', 'Upload DICOM / Imaging Files', 'Radiology', 'Attach DICOM or scanned imaging files to a radiology order'),

-- 5. Medical Store / Pharmacy (12 new)
  ('pharmacy.supplier.manage', 'Manage Suppliers', 'Medical Store', 'Add, edit, and deactivate drug/consumable suppliers'),
  ('pharmacy.po.create', 'Create Purchase Order', 'Medical Store', 'Raise a purchase order to a supplier for medicines or consumables'),
  ('pharmacy.po.view', 'View Purchase Orders', 'Medical Store', 'List and track purchase orders and their fulfilment status'),
  ('pharmacy.grn.create', 'Create Goods Receipt Note', 'Medical Store', 'Record received stock against a PO, inspect, and accept items'),
  ('pharmacy.grn.view', 'View Goods Receipt Notes', 'Medical Store', 'View GRN history and match against purchase orders'),
  ('pharmacy.stock.adjust', 'Adjust Stock', 'Medical Store', 'Record write-offs, breakages, or manual stock corrections with reason'),
  ('pharmacy.stock.audit', 'Perform Stock Audit', 'Medical Store', 'Conduct a physical stock count and reconcile with system quantities'),
  ('pharmacy.return.supplier', 'Return Stock to Supplier', 'Medical Store', 'Record supplier return transactions for damaged or expired stock'),
  ('pharmacy.indent.manage', 'Manage Department Indents', 'Medical Store', 'Approve or reject ward/department stock indent requests'),
  ('pharmacy.indent.create', 'Raise Stock Indent', 'Medical Store', 'Ward nurse raises an indent request to pharmacy for ward stock'),
  ('pharmacy.expiry.manage', 'Manage Near-Expiry Stock', 'Medical Store', 'View expiry alerts and initiate disposal or return for near-expiry items'),
  ('pharmacy.catalogue.manage', 'Manage Drug Formulary', 'Medical Store', 'Maintain the hospital formulary — add, retire, or substitute drugs'),

-- 6. Clinical (9 new)
  ('clinical.vitals.chart', 'Chart Vital Signs', 'Clinical', 'Record and trend temperature, pulse, BP, SpO2, RR, weight serially'),
  ('clinical.fluid.balance', 'Record Fluid Balance', 'Clinical', 'Document intake and output fluid balance chart for IPD patients'),
  ('clinical.wound.care', 'Record Wound Care / Dressing', 'Clinical', 'Document wound assessment, dressing type, and healing progress'),
  ('clinical.procedure.notes', 'Record Procedure Notes', 'Clinical', 'Document bedside procedures (lumbar puncture, catheterisation, etc.)'),
  ('clinical.pain.assessment', 'Record Pain Assessment', 'Clinical', 'Score and track patient pain using standardised scales (NRS, FACES)'),
  ('clinical.physio.order', 'Order Physiotherapy', 'Clinical', 'Create physiotherapy referral with goals and session frequency'),
  ('clinical.physio.notes', 'Record Physiotherapy Notes', 'Clinical', 'Physiotherapist documents session progress and functional outcomes'),
  ('clinical.referral.internal', 'Create Internal Specialist Referral', 'Clinical', 'Refer a patient to another in-hospital specialist with case summary'),
  ('clinical.template.manage', 'Manage Clinical Note Templates', 'Clinical', 'Create and manage reusable SOAP/structured note templates'),

-- 7. Billing & Finance (13 new)
  ('billing.advance.collect', 'Collect Advance Payment', 'Billing', 'Record advance deposit against a patient account before services'),
  ('billing.advance.adjust', 'Adjust Advance Against Invoice', 'Billing', 'Apply a previously collected advance to a final invoice'),
  ('billing.refund.create', 'Process Refund', 'Billing', 'Initiate refund for overpayment or cancelled services'),
  ('billing.refund.approve', 'Approve Refund', 'Billing', 'Senior staff approves refund requests above a defined threshold'),
  ('billing.credit.note', 'Issue Credit Note', 'Billing', 'Issue credit note for billing errors or service reversal'),
  ('billing.package.manage', 'Manage Service Packages', 'Billing', 'Define fixed-price surgical / maternity / procedure packages'),
  ('billing.package.apply', 'Apply Package to Invoice', 'Billing', 'Link a patient invoice to a pre-defined service package'),
  ('billing.tpa.preauth', 'Submit TPA Pre-Authorisation', 'Billing', 'Submit cashless pre-auth request to TPA/insurance company'),
  ('billing.tpa.manage', 'Manage TPA Panels', 'Billing', 'Add, edit, and configure TPA empanelment and tariff details'),
  ('billing.tax.manage', 'Manage Tax Configuration', 'Billing', 'Configure GST/HSN codes and applicable tax slabs for service items'),
  ('billing.cashier.summary', 'View Cashier Collection Summary', 'Billing', 'Daily cash-in-hand summary per cashier/shift for reconciliation'),
  ('billing.expense.create', 'Record Hospital Expense', 'Finance', 'Log operational expenses (utilities, repairs, supplies) against cost centres'),
  ('billing.expense.view', 'View Expense Register', 'Finance', 'View and filter expense register by date, department, and category'),

-- 8. HR & Staff Management (12 new)
  ('hr.staff.view', 'View Staff Directory', 'HR', 'Browse staff profiles with department, designation, and contact info'),
  ('hr.staff.manage', 'Manage Staff Profiles', 'HR', 'Create and update staff HR records (employment, qualifications, documents)'),
  ('hr.attendance.view', 'View Attendance Register', 'HR', 'View daily attendance records for staff by department and date range'),
  ('hr.attendance.mark', 'Mark Attendance', 'HR', 'Mark or correct attendance entries for self or team'),
  ('hr.roster.view', 'View Duty Roster', 'HR', 'View weekly/monthly shift schedule for staff'),
  ('hr.roster.manage', 'Manage Duty Roster', 'HR', 'Create and publish shift schedules, manage swap requests'),
  ('hr.leave.apply', 'Apply for Leave', 'HR', 'Submit leave application with type, dates, and covering colleague'),
  ('hr.leave.approve', 'Approve Leave Applications', 'HR', 'HOD/admin reviews and approves or rejects leave requests'),
  ('hr.leave.view', 'View Leave Balances', 'HR', 'View accrued, used, and available leave balance per staff member'),
  ('hr.payroll.view', 'View Payslips', 'HR', 'View and download monthly payslips'),
  ('hr.payroll.run', 'Run Payroll', 'HR', 'Process monthly payroll, apply deductions, and generate payslips'),
  ('hr.document.upload', 'Upload Staff Documents', 'HR', 'Upload and manage staff credentialing documents (licences, certificates)'),

-- 9. Assets & Maintenance (7 new)
  ('assets.register.view', 'View Asset Register', 'Assets', 'Browse all equipment and fixed assets with location and status'),
  ('assets.register.manage', 'Manage Asset Register', 'Assets', 'Add, update, or decommission equipment records with serial/asset numbers'),
  ('assets.amc.manage', 'Manage AMC Contracts', 'Assets', 'Record and track Annual Maintenance Contracts per equipment'),
  ('assets.maintenance.request', 'Raise Maintenance Request', 'Assets', 'Any staff raises a breakdown or repair ticket for equipment'),
  ('assets.maintenance.manage', 'Manage Maintenance Requests', 'Assets', 'Engineer/admin updates maintenance ticket status and resolution notes'),
  ('assets.ppm.schedule', 'Schedule Preventive Maintenance', 'Assets', 'Plan and track periodic preventive maintenance (PPM) for critical equipment'),
  ('assets.calibration.log', 'Record Equipment Calibration', 'Assets', 'Log calibration events for measuring/diagnostic equipment'),

-- 10. Reports & Analytics (10 new)
  ('reports.ipd.census', 'IPD Census & Bed Occupancy Report', 'Reports', 'Bed occupancy rate, ALOS (average length of stay), and ward-wise census'),
  ('reports.doctor.performance', 'Doctor Performance Report', 'Reports', 'Consultation count, revenue generated, and patient satisfaction per doctor'),
  ('reports.lab.tat', 'Lab Turnaround Time Report', 'Reports', 'Measure and trend sample-to-report time by test type and priority'),
  ('reports.pharmacy.consumption', 'Pharmacy Consumption Report', 'Reports', 'Drug consumption trends, slow-moving items, and ABC analysis'),
  ('reports.billing.outstanding', 'Outstanding Dues Report', 'Reports', 'Aged receivables — patients with unpaid or partially paid invoices'),
  ('reports.insurance.claims', 'Insurance Claims Status Report', 'Reports', 'Submitted, approved, rejected, and pending claim reconciliation'),
  ('reports.custom.build', 'Build Custom Report', 'Reports', 'Admin defines ad-hoc report queries from a field picker'),
  ('reports.custom.schedule', 'Schedule Report Delivery', 'Reports', 'Schedule automatic report email delivery on daily/weekly/monthly cadence'),
  ('reports.export.excel', 'Export Report to Excel', 'Reports', 'Download any tabular report as a formatted Excel/CSV file'),
  ('reports.audit.trail', 'View System Audit Trail', 'Reports', 'Security audit log of user login events, data changes, and access'),

-- 11. Quality & Compliance (8 new)
  ('quality.incident.report', 'Report Clinical Incident', 'Quality', 'Any staff member reports an adverse event, near-miss, or medication error'),
  ('quality.incident.manage', 'Manage Incident Reports', 'Quality', 'Quality team reviews, investigates, and closes incident reports'),
  ('quality.infection.log', 'Record Infection Surveillance', 'Quality', 'Log HAI (hospital-acquired infection) cases and organism type'),
  ('quality.infection.view', 'View Infection Surveillance Dashboard', 'Quality', 'Track and trend HAI rates by ward, organism, and time period'),
  ('quality.needle.stick.log', 'Record Needle-Stick Injury', 'Quality', 'Document needle-stick/sharp injury and trigger PEP protocol'),
  ('quality.audit.clinical', 'Conduct Clinical Audit', 'Quality', 'Run structured clinical audits (e.g. hand hygiene, antibiotic stewardship)'),
  ('quality.checklist.manage', 'Manage Quality Checklists', 'Quality', 'Create NABH/JCI compliance checklists and assign to departments'),
  ('quality.indicator.view', 'View Key Quality Indicators', 'Quality', 'Dashboard of KQIs — ALOS, mortality rate, re-admission rate, OT infection rate'),

-- 12. Patient Portal (11 new)
  ('portal.profile.view', 'View My Profile', 'Patient Portal', 'Patient views and verifies their demographic and contact information'),
  ('portal.profile.update', 'Update My Profile', 'Patient Portal', 'Patient updates address, emergency contact, and communication preferences'),
  ('portal.appointments.book', 'Book Appointment Online', 'Patient Portal', 'Patient books a new appointment directly from the portal'),
  ('portal.appointments.cancel', 'Cancel My Appointment', 'Patient Portal', 'Patient cancels a future appointment and triggers slot release'),
  ('portal.reports.download', 'Download Lab / Imaging Reports', 'Patient Portal', 'Patient views and downloads their lab results and radiology reports'),
  ('portal.invoices.view', 'View My Bills', 'Patient Portal', 'Patient views invoices, payments made, and outstanding balance'),
  ('portal.payment.online', 'Pay Bill Online', 'Patient Portal', 'Patient pays outstanding bills via payment gateway (UPI, card, netbanking)'),
  ('portal.prescriptions.view', 'View My Prescriptions', 'Patient Portal', 'Patient views current and past prescriptions with drug instructions'),
  ('portal.feedback.submit', 'Submit Feedback', 'Patient Portal', 'Patient submits post-visit satisfaction feedback and rating'),
  ('portal.teleconsult.request', 'Request Teleconsultation', 'Patient Portal', 'Patient requests a video/phone consultation with their doctor'),
  ('portal.health.summary', 'View My Health Summary', 'Patient Portal', 'Patient views a longitudinal summary — diagnoses, allergies, medications')
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- Assign functionalities to new permission groups (Phase D) -----------------
-- Physiotherapist gets: clinical vitals, wound care, physio orders/notes, patient view
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='PHYSIOTHERAPIST Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'patients.view', 'clinical.vitals.chart', 'clinical.wound.care', 'clinical.physio.order', 'clinical.physio.notes',
  'medical_records.view', 'medical_records.medications', 'appointments.view', 'notifications.user'
);

-- Radiologist gets: radiology orders/reports/imaging, lab sample tracking
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='RADIOLOGIST Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'lab.view', 'radiology.order.view', 'radiology.report.enter', 'radiology.image.upload',
  'lab.results.verify', 'lab.sample.track', 'medical_records.view', 'appointments.view', 'notifications.user'
);

-- HR Officer gets: all HR functionalities + staff and payroll views
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='HR_OFFICER Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'hr.staff.view', 'hr.staff.manage', 'hr.attendance.view', 'hr.attendance.mark', 'hr.roster.view', 'hr.roster.manage',
  'hr.leave.apply', 'hr.leave.approve', 'hr.leave.view', 'hr.payroll.view', 'hr.payroll.run', 'hr.document.upload', 'notifications.messages'
);

-- Engineer gets: asset management and maintenance, calibration
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='ENGINEER Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'assets.register.view', 'assets.register.manage', 'assets.amc.manage', 'assets.maintenance.request',
  'assets.maintenance.manage', 'assets.ppm.schedule', 'assets.calibration.log', 'notifications.messages'
);

-- Quality Officer gets: incident/infection reporting, audits, checklists, quality indicators
INSERT IGNORE INTO perm_group_functionality (group_id, functionality_id)
SELECT (SELECT id FROM perm_group WHERE name='QUALITY_OFFICER Group' LIMIT 1), id FROM auth_functionality WHERE code IN (
  'dashboard.view', 'quality.incident.report', 'quality.incident.manage', 'quality.infection.log', 'quality.infection.view',
  'quality.needle.stick.log', 'quality.audit.clinical', 'quality.checklist.manage', 'quality.indicator.view',
  'reports.view', 'notifications.messages', 'admin.users'
);
