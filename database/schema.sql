-- =============================================================================
-- HMIS — MySQL 8 schema
-- Single logical database `hmis` with prefixed table names per bounded context.
-- Engine: InnoDB, Charset: utf8mb4, Collation: utf8mb4_0900_ai_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS hmis
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE hmis;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================================
-- AUTH
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth_role (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(40)  NOT NULL UNIQUE,
  description VARCHAR(200) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_user (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username              VARCHAR(80)  NOT NULL UNIQUE,
  email                 VARCHAR(160) NOT NULL UNIQUE,
  password_hash         VARCHAR(200) NOT NULL,
  mfa_secret            VARCHAR(64)  NULL,
  mfa_enabled           TINYINT(1)   NOT NULL DEFAULT 0,
  status                VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  failed_attempts       INT          NOT NULL DEFAULT 0,
  locked_until          DATETIME     NULL,
  last_login_at         DATETIME     NULL,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_user_role (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_aur_user FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
  CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES auth_role(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_refresh_token (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  jti         CHAR(36) NOT NULL UNIQUE,
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_art_user (user_id),
  CONSTRAINT fk_art_user FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NULL,
  event      VARCHAR(40)  NOT NULL,
  ip_address VARCHAR(64)  NULL,
  user_agent VARCHAR(255) NULL,
  detail     JSON         NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aal_user (user_id),
  INDEX idx_aal_event (event)
) ENGINE=InnoDB;

-- Organization/Category table
CREATE TABLE IF NOT EXISTS auth_organization (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(80)  NOT NULL,
  created_by  BIGINT UNSIGNED NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ao_creator FOREIGN KEY (created_by) REFERENCES auth_user(id) ON DELETE SET NULL,
  INDEX idx_ao_category (category),
  INDEX idx_ao_status (status)
) ENGINE=InnoDB;

-- Functionality/Permission table
CREATE TABLE IF NOT EXISTS auth_functionality (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(80) NOT NULL UNIQUE,
  label       VARCHAR(120) NOT NULL,
  module      VARCHAR(40)  NOT NULL,
  description VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_af_module (module)
) ENGINE=InnoDB;

-- Permission Group (admin-created)
CREATE TABLE IF NOT EXISTS perm_group (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  org_id      BIGINT UNSIGNED NOT NULL,
  created_by  BIGINT UNSIGNED NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pg_org FOREIGN KEY (org_id) REFERENCES auth_organization(id) ON DELETE CASCADE,
  CONSTRAINT fk_pg_creator FOREIGN KEY (created_by) REFERENCES auth_user(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_pg_org_name (org_id, name),
  INDEX idx_pg_status (status)
) ENGINE=InnoDB;

-- Group-to-Functionality mapping
CREATE TABLE IF NOT EXISTS perm_group_functionality (
  group_id        BIGINT UNSIGNED NOT NULL,
  functionality_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (group_id, functionality_id),
  CONSTRAINT fk_pgf_group FOREIGN KEY (group_id) REFERENCES perm_group(id) ON DELETE CASCADE,
  CONSTRAINT fk_pgf_func FOREIGN KEY (functionality_id) REFERENCES auth_functionality(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Permission Role (admin-created custom role)
CREATE TABLE IF NOT EXISTS perm_role (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(80)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  org_id      BIGINT UNSIGNED NOT NULL,
  created_by  BIGINT UNSIGNED NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_org FOREIGN KEY (org_id) REFERENCES auth_organization(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_creator FOREIGN KEY (created_by) REFERENCES auth_user(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_pr_org_code (org_id, code),
  INDEX idx_pr_status (status)
) ENGINE=InnoDB;

-- Role-to-Group mapping
CREATE TABLE IF NOT EXISTS perm_role_group (
  role_id  BIGINT UNSIGNED NOT NULL,
  group_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, group_id),
  CONSTRAINT fk_prg_role FOREIGN KEY (role_id) REFERENCES perm_role(id) ON DELETE CASCADE,
  CONSTRAINT fk_prg_group FOREIGN KEY (group_id) REFERENCES perm_group(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User-to-Permission-Role mapping
CREATE TABLE IF NOT EXISTS auth_user_perm_role (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_aupr_user FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
  CONSTRAINT fk_aupr_role FOREIGN KEY (role_id) REFERENCES perm_role(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Add org_id to auth_user (nullable for backward compatibility)
ALTER TABLE auth_user ADD COLUMN org_id BIGINT UNSIGNED NULL AFTER email;
ALTER TABLE auth_user ADD CONSTRAINT fk_au_org FOREIGN KEY (org_id) REFERENCES auth_organization(id) ON DELETE SET NULL;

-- =============================================================================
-- PATIENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS patient_patient (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  mrn               VARCHAR(32)  NOT NULL UNIQUE,
  first_name        VARCHAR(80)  NOT NULL,
  last_name         VARCHAR(80)  NOT NULL,
  dob               DATE         NOT NULL,
  gender            CHAR(1)      NOT NULL,
  phone             VARCHAR(20)  NULL,
  email             VARCHAR(160) NULL,
  address           TEXT         NULL,
  emergency_contact VARCHAR(120) NULL,
  blood_group       VARCHAR(4)   NULL,
  version           BIGINT       NOT NULL DEFAULT 0,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_patient_gender CHECK (gender IN ('M','F','O')),
  INDEX idx_patient_name (last_name, first_name),
  INDEX idx_patient_phone (phone),
  INDEX idx_patient_dup (last_name, first_name, dob, phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_appointment (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id  BIGINT UNSIGNED NOT NULL,
  doctor_id   BIGINT UNSIGNED NOT NULL,
  slot_start  DATETIME     NOT NULL,
  slot_end    DATETIME     NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'BOOKED',
  reason      VARCHAR(200) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_appt_patient (patient_id),
  INDEX idx_appt_doctor_slot (doctor_id, slot_start, slot_end),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id),
  CONSTRAINT chk_appt_status CHECK (status IN ('BOOKED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_encounter (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  type         VARCHAR(20)  NOT NULL DEFAULT 'OPD',
  started_at   DATETIME     NOT NULL,
  ended_at     DATETIME     NULL,
  chief_complaint VARCHAR(500) NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enc_patient (patient_id),
  CONSTRAINT fk_enc_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_consent (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  type         VARCHAR(80)  NOT NULL,
  description  VARCHAR(500) NULL,
  signed_by    VARCHAR(120) NULL,
  signed_at    DATETIME NULL,
  revoked_at   DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_consent_patient (patient_id),
  CONSTRAINT fk_consent_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_insurance (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  provider     VARCHAR(120) NOT NULL,
  policy_no    VARCHAR(80)  NOT NULL,
  member_id    VARCHAR(80)  NULL,
  group_id     VARCHAR(80)  NULL,
  valid_from   DATE NOT NULL,
  valid_until  DATE NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_insurance_patient (patient_id),
  INDEX idx_insurance_status (status),
  CONSTRAINT fk_insurance_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment_slot (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  day_of_week  VARCHAR(10)  NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  max_appointments INT NOT NULL DEFAULT 1,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slot_doctor (doctor_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointment_waitlist (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  preferred_date DATE NOT NULL,
  reason       VARCHAR(200) NULL,
  position     INT NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'WAITING',
  notified_at  DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_waitlist_patient (patient_id),
  INDEX idx_waitlist_doctor (doctor_id),
  INDEX idx_waitlist_status (status),
  CONSTRAINT fk_waitlist_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- CLINICAL
-- =============================================================================

CREATE TABLE IF NOT EXISTS clinical_note (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  encounter_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  note         JSON NOT NULL,
  signed_at    DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_note_enc (encounter_id),
  INDEX idx_note_patient (patient_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_diagnosis (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  encounter_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  code         VARCHAR(20) NOT NULL,
  code_system  VARCHAR(20) NOT NULL DEFAULT 'ICD10',
  description  VARCHAR(300) NOT NULL,
  severity     VARCHAR(20) NULL,
  onset_date   DATE NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dx_patient (patient_id),
  INDEX idx_dx_code (code)
) ENGINE=InnoDB;

-- =============================================================================
-- LAB
-- =============================================================================

CREATE TABLE IF NOT EXISTS lab_test (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(30) NOT NULL UNIQUE,
  name        VARCHAR(200) NOT NULL,
  specimen    VARCHAR(60) NULL,
  loinc       VARCHAR(20) NULL,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  active      TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lab_order (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  encounter_id BIGINT UNSIGNED NULL,
  test_code    VARCHAR(30) NOT NULL,
  priority     VARCHAR(10) NOT NULL DEFAULT 'ROUTINE',
  status       VARCHAR(20) NOT NULL DEFAULT 'ORDERED',
  ordered_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lo_patient (patient_id),
  INDEX idx_lo_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lab_sample (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id    BIGINT UNSIGNED NOT NULL,
  barcode     VARCHAR(64) NOT NULL UNIQUE,
  collected_at DATETIME NULL,
  received_at  DATETIME NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'COLLECTED',
  INDEX idx_ls_order (order_id),
  CONSTRAINT fk_ls_order FOREIGN KEY (order_id) REFERENCES lab_order(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lab_result (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sample_id     BIGINT UNSIGNED NOT NULL,
  analyte_code  VARCHAR(30) NOT NULL,
  value         VARCHAR(200) NOT NULL,
  unit          VARCHAR(40) NULL,
  reference_range VARCHAR(80) NULL,
  abnormal_flag VARCHAR(4)  NULL,
  verified_by   BIGINT UNSIGNED NULL,
  reported_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lr_sample (sample_id),
  CONSTRAINT fk_lr_sample FOREIGN KEY (sample_id) REFERENCES lab_sample(id)
) ENGINE=InnoDB;

-- =============================================================================
-- PHARMACY
-- =============================================================================

CREATE TABLE IF NOT EXISTS pharmacy_medicine (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sku          VARCHAR(40) NOT NULL UNIQUE,
  name         VARCHAR(200) NOT NULL,
  strength     VARCHAR(60) NULL,
  form         VARCHAR(40) NULL,
  schedule     VARCHAR(10) NULL,
  unit_price   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reorder_level INT NOT NULL DEFAULT 10,
  active       TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_batch (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  medicine_id  BIGINT UNSIGNED NOT NULL,
  batch_no     VARCHAR(40) NOT NULL,
  expiry_date  DATE NOT NULL,
  qty_on_hand  INT NOT NULL DEFAULT 0,
  cost_price   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  UNIQUE KEY ux_batch (medicine_id, batch_no),
  INDEX idx_batch_exp (expiry_date),
  CONSTRAINT fk_batch_med FOREIGN KEY (medicine_id) REFERENCES pharmacy_medicine(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_prescription (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  encounter_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  notes        VARCHAR(500) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rx_patient (patient_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_prescription_item (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  prescription_id  BIGINT UNSIGNED NOT NULL,
  medicine_id      BIGINT UNSIGNED NOT NULL,
  dose             VARCHAR(60) NOT NULL,
  frequency        VARCHAR(60) NOT NULL,
  duration_days    INT NOT NULL DEFAULT 1,
  qty              INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_rxi_rx  FOREIGN KEY (prescription_id) REFERENCES pharmacy_prescription(id) ON DELETE CASCADE,
  CONSTRAINT fk_rxi_med FOREIGN KEY (medicine_id) REFERENCES pharmacy_medicine(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_dispense (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  prescription_id  BIGINT UNSIGNED NOT NULL,
  batch_id         BIGINT UNSIGNED NOT NULL,
  qty              INT NOT NULL,
  dispensed_by     BIGINT UNSIGNED NOT NULL,
  dispensed_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_price      DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_disp_rx    FOREIGN KEY (prescription_id) REFERENCES pharmacy_prescription(id),
  CONSTRAINT fk_disp_batch FOREIGN KEY (batch_id)         REFERENCES pharmacy_batch(id)
) ENGINE=InnoDB;

-- =============================================================================
-- BILLING
-- =============================================================================

CREATE TABLE IF NOT EXISTS billing_invoice (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_no    VARCHAR(40)  NOT NULL UNIQUE,
  patient_id    BIGINT UNSIGNED NOT NULL,
  encounter_id  BIGINT UNSIGNED NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  subtotal      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  balance_due   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_inv_patient (patient_id),
  INDEX idx_inv_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS billing_invoice_item (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_id  BIGINT UNSIGNED NOT NULL,
  item_type   VARCHAR(20) NOT NULL,
  description VARCHAR(200) NOT NULL,
  qty         INT NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  tax         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total       DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id) REFERENCES billing_invoice(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS billing_payment (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_id  BIGINT UNSIGNED NOT NULL,
  method      VARCHAR(20) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  txn_ref     VARCHAR(120) NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'CAPTURED',
  paid_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) REFERENCES billing_invoice(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS billing_insurance_claim (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_id    BIGINT UNSIGNED NOT NULL,
  payer_code    VARCHAR(40) NOT NULL,
  claim_no      VARCHAR(60) NOT NULL UNIQUE,
  amount        DECIMAL(12,2) NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
  submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decision_at   DATETIME NULL,
  remarks       VARCHAR(500) NULL,
  CONSTRAINT fk_claim_invoice FOREIGN KEY (invoice_id) REFERENCES billing_invoice(id)
) ENGINE=InnoDB;

-- =============================================================================
-- REPORTING
-- =============================================================================

CREATE TABLE IF NOT EXISTS reporting_daily_mis (
  report_date        DATE NOT NULL,
  site               VARCHAR(20) NOT NULL,
  opd_count          INT NOT NULL DEFAULT 0,
  ipd_admissions     INT NOT NULL DEFAULT 0,
  ipd_discharges     INT NOT NULL DEFAULT 0,
  lab_orders         INT NOT NULL DEFAULT 0,
  rx_dispensed       INT NOT NULL DEFAULT 0,
  revenue_gross      DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  revenue_net        DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (report_date, site)
) ENGINE=InnoDB;

-- =============================================================================
-- PRESCRIPTION SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS prescription_prescription (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  encounter_id      BIGINT UNSIGNED NOT NULL,
  patient_id        BIGINT UNSIGNED NOT NULL,
  doctor_id         BIGINT UNSIGNED NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  clinical_notes    TEXT NULL,
  approval_notes    TEXT NULL,
  signed_at         DATETIME NULL,
  cancelled_at      DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rx_patient (patient_id),
  INDEX idx_rx_doctor (doctor_id),
  INDEX idx_rx_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS prescription_item (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  prescription_id   BIGINT UNSIGNED NOT NULL,
  medicine_id       BIGINT UNSIGNED NOT NULL,
  dose              VARCHAR(60) NOT NULL,
  frequency         VARCHAR(60) NOT NULL,
  duration_days     INT NOT NULL DEFAULT 1,
  qty               INT NOT NULL DEFAULT 1,
  instructions      TEXT NULL,
  clinical_reason   TEXT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prxi_rx FOREIGN KEY (prescription_id) REFERENCES prescription_prescription(id) ON DELETE CASCADE,
  INDEX idx_prxi_med (medicine_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS prescription_approval_log (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  prescription_id   BIGINT UNSIGNED NOT NULL,
  doctor_id         BIGINT UNSIGNED NOT NULL,
  action            VARCHAR(20) NOT NULL,
  comments          TEXT NULL,
  timestamp         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pral_rx FOREIGN KEY (prescription_id) REFERENCES prescription_prescription(id) ON DELETE CASCADE,
  INDEX idx_pral_action (action)
) ENGINE=InnoDB;

-- =============================================================================
-- MEDICAL RECORDS SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS medical_record_document (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT UNSIGNED NOT NULL,
  doc_type          VARCHAR(30) NOT NULL,
  file_url          VARCHAR(500) NOT NULL,
  uploaded_by       BIGINT UNSIGNED NOT NULL,
  uploaded_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mrd_patient (patient_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_allergy (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT UNSIGNED NOT NULL,
  allergen          VARCHAR(200) NOT NULL,
  reaction_type     VARCHAR(100) NOT NULL,
  severity          VARCHAR(20) NOT NULL,
  documented_by     BIGINT UNSIGNED NOT NULL,
  documented_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pa_patient (patient_id)
) ENGINE=InnoDB;

-- =============================================================================
-- CLINICAL SUPPORT SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS clinical_drug_interaction (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  drug1_id          BIGINT UNSIGNED NOT NULL,
  drug2_id          BIGINT UNSIGNED NOT NULL,
  interaction_level VARCHAR(20) NOT NULL,
  severity          VARCHAR(20) NULL,
  description       TEXT NOT NULL,
  UNIQUE KEY uk_drug_pair (drug1_id, drug2_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_contraindication (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  medicine_id       BIGINT UNSIGNED NOT NULL,
  condition_code    VARCHAR(20) NOT NULL,
  severity          VARCHAR(20) NOT NULL,
  notes             TEXT NULL,
  UNIQUE KEY uk_med_condition (medicine_id, condition_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_audit_log (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  doctor_id         BIGINT UNSIGNED NOT NULL,
  patient_id        BIGINT UNSIGNED NOT NULL,
  action            VARCHAR(100) NOT NULL,
  details           JSON NULL,
  timestamp         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cal_doctor (doctor_id),
  INDEX idx_cal_patient (patient_id),
  INDEX idx_cal_action (action)
) ENGINE=InnoDB;

-- =============================================================================
-- IPD SERVICE (In-Patient Department)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ipd_ward (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  total_beds        INT NOT NULL DEFAULT 20,
  category          VARCHAR(40) NOT NULL,
  active            TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_bed (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ward_id           BIGINT UNSIGNED NOT NULL,
  bed_number        VARCHAR(20) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  UNIQUE KEY uk_ward_bed (ward_id, bed_number),
  CONSTRAINT fk_bed_ward FOREIGN KEY (ward_id) REFERENCES ipd_ward(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_admission (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT UNSIGNED NOT NULL,
  doctor_id         BIGINT UNSIGNED NOT NULL,
  bed_id            BIGINT UNSIGNED NULL,
  admission_type    VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  reason            VARCHAR(500) NOT NULL,
  expected_stay     INT NULL,
  admitted_by       BIGINT UNSIGNED NOT NULL,
  admitted_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  INDEX idx_adm_patient (patient_id),
  INDEX idx_adm_status (status),
  CONSTRAINT fk_adm_bed FOREIGN KEY (bed_id) REFERENCES ipd_bed(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_discharge (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id      BIGINT UNSIGNED NOT NULL,
  discharge_type    VARCHAR(20) NOT NULL,
  discharge_summary TEXT NULL,
  follow_up_date    DATE NULL,
  discharged_by     BIGINT UNSIGNED NOT NULL,
  discharged_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_disc_adm FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- NOTIFICATION SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS notification_message (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sender_id         BIGINT UNSIGNED NOT NULL,
  recipient_id      BIGINT UNSIGNED NOT NULL,
  subject           VARCHAR(200) NOT NULL,
  body              TEXT NOT NULL,
  message_type      VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
  sent_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status            VARCHAR(20) NOT NULL DEFAULT 'SENT',
  INDEX idx_msg_recipient (recipient_id),
  INDEX idx_msg_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_notification (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  type              VARCHAR(20) NOT NULL,
  subject           VARCHAR(200) NOT NULL,
  body              TEXT NOT NULL,
  priority          VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  sent_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at           DATETIME NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'SENT',
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (read_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_appointment_reminder (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  appointment_id    BIGINT UNSIGNED NOT NULL,
  patient_id        BIGINT UNSIGNED NOT NULL,
  reminder_type     VARCHAR(20) NOT NULL,
  hours_before      INT NOT NULL DEFAULT 24,
  sent_at           DATETIME NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
) ENGINE=InnoDB;

-- =============================================================================
-- ENHANCEMENTS: PATIENT FLOW, ADMISSION & HOSPITAL OPERATIONS
-- =============================================================================

-- Enhancement 1: Patient Visit Category (OPD / Casualty) ---------------------
-- Guarded so re-running the script does not fail if the column already exists.
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patient_patient' AND COLUMN_NAME = 'visit_category');
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE patient_patient ADD COLUMN visit_category VARCHAR(20) NOT NULL DEFAULT ''OPD'' AFTER blood_group',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------------------------------
-- FRONT DESK SERVICE (triage, check-in, doctor queue, emergency)
-- -----------------------------------------------------------------------------

-- Enhancement 2: Triage
CREATE TABLE IF NOT EXISTS frontdesk_triage (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT UNSIGNED NOT NULL,
  appointment_id    BIGINT UNSIGNED NULL,
  temperature       DECIMAL(4,1) NULL,
  pulse             INT NULL,
  bp_systolic       INT NULL,
  bp_diastolic      INT NULL,
  oxygen_saturation INT NULL,
  weight            DECIMAL(5,2) NULL,
  height            DECIMAL(5,2) NULL,
  chief_complaint   VARCHAR(500) NULL,
  priority          VARCHAR(10) NOT NULL DEFAULT 'GREEN',
  status            VARCHAR(20) NOT NULL DEFAULT 'WAITING',
  triaged_by        BIGINT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_triage_patient (patient_id),
  INDEX idx_triage_priority (priority),
  INDEX idx_triage_status (status),
  CONSTRAINT fk_triage_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id),
  CONSTRAINT chk_triage_priority CHECK (priority IN ('GREEN','YELLOW','RED'))
) ENGINE=InnoDB;

-- Enhancement 3: Reception Check-In Desk
CREATE TABLE IF NOT EXISTS frontdesk_checkin (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT UNSIGNED NOT NULL,
  appointment_id    BIGINT UNSIGNED NULL,
  token_no          VARCHAR(20) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
  queue_position    INT NULL,
  checked_in_by     BIGINT UNSIGNED NULL,
  checked_in_at     DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_checkin_patient (patient_id),
  INDEX idx_checkin_status (status),
  CONSTRAINT fk_checkin_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id),
  CONSTRAINT chk_checkin_status CHECK (status IN ('BOOKED','CHECKED_IN','WAITING','IN_CONSULTATION','COMPLETED'))
) ENGINE=InnoDB;

-- Enhancement 4: Doctor Queue Management
CREATE TABLE IF NOT EXISTS frontdesk_queue (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  doctor_id         BIGINT UNSIGNED NOT NULL,
  patient_id        BIGINT UNSIGNED NOT NULL,
  checkin_id        BIGINT UNSIGNED NULL,
  token_no          VARCHAR(20) NULL,
  queue_position    INT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'WAITING',
  called_at         DATETIME NULL,
  started_at        DATETIME NULL,
  completed_at      DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_queue_doctor (doctor_id),
  INDEX idx_queue_status (status),
  CONSTRAINT fk_queue_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id),
  CONSTRAINT fk_queue_checkin FOREIGN KEY (checkin_id) REFERENCES frontdesk_checkin(id) ON DELETE SET NULL,
  CONSTRAINT chk_queue_status CHECK (status IN ('WAITING','IN_CONSULTATION','COMPLETED','SKIPPED','NO_SHOW'))
) ENGINE=InnoDB;

-- Enhancement 5: Casualty / Emergency Module
CREATE TABLE IF NOT EXISTS frontdesk_emergency (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  emergency_no        VARCHAR(20) NOT NULL UNIQUE,
  patient_id          BIGINT UNSIGNED NULL,
  arrival_time        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  incident_type       VARCHAR(100) NULL,
  severity            VARCHAR(10) NOT NULL DEFAULT 'YELLOW',
  brought_by          VARCHAR(120) NULL,
  ambulance_number    VARCHAR(40) NULL,
  emergency_doctor_id BIGINT UNSIGNED NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'WAITING',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emerg_patient (patient_id),
  INDEX idx_emerg_status (status),
  CONSTRAINT fk_emerg_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE SET NULL,
  CONSTRAINT chk_emerg_severity CHECK (severity IN ('GREEN','YELLOW','RED')),
  CONSTRAINT chk_emerg_status CHECK (status IN ('WAITING','UNDER_TREATMENT','OBSERVATION','ADMITTED','DISCHARGED'))
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- IPD SERVICE EXTENSIONS (admissions, beds, wards, transfers, ICU, nursing, discharge)
-- -----------------------------------------------------------------------------

-- Helper procedure: add a column only if it does not already exist.
DROP PROCEDURE IF EXISTS hmis_add_col;
DELIMITER //
CREATE PROCEDURE hmis_add_col(IN tname VARCHAR(64), IN cname VARCHAR(64), IN cdef VARCHAR(255))
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tname AND COLUMN_NAME = cname) = 0 THEN
    SET @s := CONCAT('ALTER TABLE ', tname, ' ADD COLUMN ', cname, ' ', cdef);
    PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
  END IF;
END //
DELIMITER ;

-- Enhancement 7: Ward / Bed extensions
CALL hmis_add_col('ipd_ward', 'floor', 'VARCHAR(20) NULL');
CALL hmis_add_col('ipd_bed',  'floor', 'VARCHAR(20) NULL');

-- Enhancement 6/9/10: Admission extensions
CALL hmis_add_col('ipd_admission', 'admission_no',         'VARCHAR(20) NULL');
CALL hmis_add_col('ipd_admission', 'admission_source',     "VARCHAR(30) NOT NULL DEFAULT 'PLANNED'");
CALL hmis_add_col('ipd_admission', 'department',           'VARCHAR(80) NULL');
CALL hmis_add_col('ipd_admission', 'bed_type',             'VARCHAR(40) NULL');
CALL hmis_add_col('ipd_admission', 'emergency_id',         'BIGINT UNSIGNED NULL');
CALL hmis_add_col('ipd_admission', 'consulting_doctor_id', 'BIGINT UNSIGNED NULL');

DROP PROCEDURE IF EXISTS hmis_add_col;

-- Enhancement 8: Patient Transfer System
CREATE TABLE IF NOT EXISTS ipd_transfer (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  from_bed_id     BIGINT UNSIGNED NULL,
  to_bed_id       BIGINT UNSIGNED NULL,
  from_location   VARCHAR(80) NULL,
  to_location     VARCHAR(80) NULL,
  reason          VARCHAR(500) NULL,
  doctor_approval TINYINT(1) NOT NULL DEFAULT 0,
  approved_by     BIGINT UNSIGNED NULL,
  transferred_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transfer_admission (admission_id),
  CONSTRAINT fk_transfer_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Enhancement 12: ICU Management
CREATE TABLE IF NOT EXISTS ipd_icu_record (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id       BIGINT UNSIGNED NOT NULL,
  patient_id         BIGINT UNSIGNED NOT NULL,
  bed_id             BIGINT UNSIGNED NULL,
  assigned_doctor_id BIGINT UNSIGNED NULL,
  assigned_nurse_id  BIGINT UNSIGNED NULL,
  critical           TINYINT(1) NOT NULL DEFAULT 0,
  admitted_to_icu_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  transferred_out_at DATETIME NULL,
  status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_icu_admission (admission_id),
  INDEX idx_icu_status (status),
  CONSTRAINT fk_icu_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Enhancement 11: Nursing Station
CREATE TABLE IF NOT EXISTS ipd_nursing_note (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id  BIGINT UNSIGNED NOT NULL,
  patient_id    BIGINT UNSIGNED NOT NULL,
  nurse_id      BIGINT UNSIGNED NOT NULL,
  note_type     VARCHAR(20) NOT NULL DEFAULT 'OBSERVATION',
  vitals        JSON NULL,
  medication    VARCHAR(200) NULL,
  note          TEXT NULL,
  recorded_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nursing_admission (admission_id),
  CONSTRAINT fk_nursing_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE,
  CONSTRAINT chk_nursing_type CHECK (note_type IN ('VITALS','MEDICATION','OBSERVATION'))
) ENGINE=InnoDB;

-- Enhancement 14: Discharge workflow request
CREATE TABLE IF NOT EXISTS ipd_discharge_request (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id      BIGINT UNSIGNED NOT NULL,
  requested_by      BIGINT UNSIGNED NOT NULL,
  billing_cleared   TINYINT(1) NOT NULL DEFAULT 0,
  pharmacy_cleared  TINYINT(1) NOT NULL DEFAULT 0,
  final_approved    TINYINT(1) NOT NULL DEFAULT 0,
  approved_by       BIGINT UNSIGNED NULL,
  status            VARCHAR(25) NOT NULL DEFAULT 'REQUESTED',
  discharge_summary TEXT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_disc_req_admission (admission_id),
  INDEX idx_disc_req_status (status),
  CONSTRAINT fk_disc_req_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE,
  CONSTRAINT chk_disc_req_status CHECK (status IN ('REQUESTED','BILLING_CLEARED','PHARMACY_CLEARED','APPROVED','COMPLETED'))
) ENGINE=InnoDB;

-- PHASE B: Additional tables for extended functionality

-- =============================================================================
-- FRONTDESK SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS opd_token_series (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department   VARCHAR(80)  NOT NULL,
  series_name  VARCHAR(40)  NOT NULL,
  current_num  INT NOT NULL DEFAULT 0,
  reset_daily  TINYINT(1) NOT NULL DEFAULT 1,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_token_dept (department)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS visitor_pass (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  visitor_name VARCHAR(120) NOT NULL,
  relationship VARCHAR(40)  NULL,
  pass_number  VARCHAR(40)  NOT NULL UNIQUE,
  issued_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until  DATETIME NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT fk_vp_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patient_feedback (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NULL,
  department   VARCHAR(80)  NULL,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments     VARCHAR(500) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_patient (patient_id),
  INDEX idx_feedback_dept (department),
  CONSTRAINT fk_fb_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS referral_outward (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  referral_to  VARCHAR(120) NOT NULL,
  reason       VARCHAR(500) NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ref_patient (patient_id),
  CONSTRAINT fk_ref_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS referral_inward (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  referred_from VARCHAR(120) NOT NULL,
  referred_by  VARCHAR(120) NOT NULL,
  reason       VARCHAR(500) NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'REGISTERED',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ref_in_patient (patient_id),
  CONSTRAINT fk_ref_in_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- IPD SERVICE (Additional tables)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ipd_diet_order (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  diet_type    VARCHAR(60)  NOT NULL,
  restrictions VARCHAR(500) NULL,
  ordered_by   BIGINT UNSIGNED NOT NULL,
  ordered_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  ended_at     DATETIME NULL,
  INDEX idx_diet_admission (admission_id),
  CONSTRAINT fk_diet_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_ot_schedule (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  scheduled_date DATETIME NOT NULL,
  surgeon_id   BIGINT UNSIGNED NOT NULL,
  anaesthetist_id BIGINT UNSIGNED NULL,
  `procedure`    VARCHAR(200) NOT NULL,
  notes        VARCHAR(500) NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ot_admission (admission_id),
  CONSTRAINT fk_ot_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_ot_notes (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  surgeon_id   BIGINT UNSIGNED NOT NULL,
  preop_findings VARCHAR(500) NULL,
  procedure_done VARCHAR(200) NOT NULL,
  intraop_findings VARCHAR(500) NULL,
  postop_instructions VARCHAR(500) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otd_admission (admission_id),
  CONSTRAINT fk_otd_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_anaesthesia_record (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  anaesthetist_id BIGINT UNSIGNED NOT NULL,
  anaesthesia_type VARCHAR(60) NOT NULL,
  induction_agent VARCHAR(80) NULL,
  maintenance_agent VARCHAR(80) NULL,
  monitoring_notes VARCHAR(500) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ana_admission (admission_id),
  CONSTRAINT fk_ana_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_birth_record (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  mother_id    BIGINT UNSIGNED NOT NULL,
  child_name   VARCHAR(120) NULL,
  dob          DATETIME NOT NULL,
  gender       CHAR(1) NOT NULL,
  weight       DECIMAL(5,2) NULL,
  live_birth   TINYINT(1) NOT NULL DEFAULT 1,
  apgar_score  INT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_birth_admission (admission_id),
  CONSTRAINT fk_birth_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_death_record (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  death_time   DATETIME NOT NULL,
  death_cause  VARCHAR(300) NOT NULL,
  certified_by BIGINT UNSIGNED NOT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_death_patient (patient_id),
  CONSTRAINT fk_death_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ipd_mlc_record (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  case_type    VARCHAR(60)  NOT NULL,
  injury_details VARCHAR(500) NULL,
  police_reported TINYINT(1) NOT NULL DEFAULT 0,
  police_station VARCHAR(120) NULL,
  fir_number   VARCHAR(40)  NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mlc_patient (patient_id),
  CONSTRAINT fk_mlc_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- LAB SERVICE (Radiology)
-- =============================================================================

CREATE TABLE IF NOT EXISTS radiology_order (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  modality     VARCHAR(40)  NOT NULL,
  body_part    VARCHAR(80)  NOT NULL,
  indication   VARCHAR(300) NULL,
  priority     VARCHAR(10)  NOT NULL DEFAULT 'ROUTINE',
  status       VARCHAR(20)  NOT NULL DEFAULT 'ORDERED',
  ordered_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  INDEX idx_rad_patient (patient_id),
  INDEX idx_rad_status (status),
  CONSTRAINT fk_rad_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS radiology_report (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT UNSIGNED NOT NULL,
  radiologist_id BIGINT UNSIGNED NOT NULL,
  findings     TEXT NOT NULL,
  impression   VARCHAR(500) NOT NULL,
  recommendations VARCHAR(500) NULL,
  reported_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_radrep_order FOREIGN KEY (order_id) REFERENCES radiology_order(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS radiology_image (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT UNSIGNED NOT NULL,
  image_path   VARCHAR(300) NOT NULL,
  dicom_file   VARCHAR(300) NULL,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_radimg_order FOREIGN KEY (order_id) REFERENCES radiology_order(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- PHARMACY SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS pharmacy_supplier (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  contact_person VARCHAR(80) NULL,
  phone        VARCHAR(20)  NULL,
  email        VARCHAR(160) NULL,
  address      TEXT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_purchase_order (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  supplier_id  BIGINT UNSIGNED NOT NULL,
  po_number    VARCHAR(40)  NOT NULL UNIQUE,
  po_date      DATE NOT NULL,
  expected_delivery DATE NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFTED',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_po_supplier (supplier_id),
  CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES pharmacy_supplier(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_grn (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  po_id        BIGINT UNSIGNED NOT NULL,
  grn_number   VARCHAR(40)  NOT NULL UNIQUE,
  received_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_items  INT NOT NULL DEFAULT 0,
  accepted_items INT NOT NULL DEFAULT 0,
  status       VARCHAR(20)  NOT NULL DEFAULT 'RECEIVED',
  CONSTRAINT fk_grn_po FOREIGN KEY (po_id) REFERENCES pharmacy_purchase_order(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pharmacy_indent (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department   VARCHAR(80)  NOT NULL,
  requested_by BIGINT UNSIGNED NOT NULL,
  medicine_id  BIGINT UNSIGNED NOT NULL,
  quantity     INT NOT NULL,
  reason       VARCHAR(300) NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  approved_at  DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_indent_dept (department),
  INDEX idx_indent_status (status),
  CONSTRAINT fk_indent_med FOREIGN KEY (medicine_id) REFERENCES pharmacy_medicine(id)
) ENGINE=InnoDB;

-- =============================================================================
-- CLINICAL SERVICE (Additional tables)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clinical_vitals (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  nurse_id     BIGINT UNSIGNED NOT NULL,
  temperature  DECIMAL(5,2) NULL,
  pulse        INT NULL,
  bp_systolic  INT NULL,
  bp_diastolic INT NULL,
  spo2         INT NULL,
  rr           INT NULL,
  weight       DECIMAL(6,2) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vitals_admission (admission_id),
  CONSTRAINT fk_vitals_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_fluid_balance (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  nurse_id     BIGINT UNSIGNED NOT NULL,
  intake_ml    INT NOT NULL DEFAULT 0,
  intake_notes VARCHAR(200) NULL,
  output_ml    INT NOT NULL DEFAULT 0,
  output_notes VARCHAR(200) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fluid_admission (admission_id),
  CONSTRAINT fk_fluid_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_wound_care (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  nurse_id     BIGINT UNSIGNED NOT NULL,
  wound_location VARCHAR(120) NOT NULL,
  wound_status VARCHAR(60)  NOT NULL,
  dressing_type VARCHAR(80) NOT NULL,
  notes        VARCHAR(500) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wound_admission (admission_id),
  CONSTRAINT fk_wound_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_procedure (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  procedure_type VARCHAR(120) NOT NULL,
  findings     VARCHAR(500) NULL,
  complications VARCHAR(500) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_proc_admission (admission_id),
  CONSTRAINT fk_proc_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_pain_assessment (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  nurse_id     BIGINT UNSIGNED NOT NULL,
  pain_scale   INT NOT NULL CHECK (pain_scale BETWEEN 0 AND 10),
  scale_type   VARCHAR(20)  NOT NULL DEFAULT 'NRS',
  location     VARCHAR(120) NULL,
  management   VARCHAR(300) NULL,
  assessed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pain_admission (admission_id),
  CONSTRAINT fk_pain_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_physio_referral (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  doctor_id    BIGINT UNSIGNED NOT NULL,
  goals        VARCHAR(500) NOT NULL,
  frequency    VARCHAR(60)  NOT NULL,
  referred_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  INDEX idx_physio_admission (admission_id),
  CONSTRAINT fk_physio_admission FOREIGN KEY (admission_id) REFERENCES ipd_admission(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clinical_physio_note (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  referral_id  BIGINT UNSIGNED NOT NULL,
  patient_id   BIGINT UNSIGNED NOT NULL,
  physio_id    BIGINT UNSIGNED NOT NULL,
  session_notes VARCHAR(500) NULL,
  progress     VARCHAR(300) NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_physio_note_ref (referral_id),
  CONSTRAINT fk_physio_note_ref FOREIGN KEY (referral_id) REFERENCES clinical_physio_referral(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- BILLING SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS billing_advance (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  collected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  CONSTRAINT fk_adv_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS billing_refund (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  reason       VARCHAR(300) NOT NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at  DATETIME NULL,
  approved_by  BIGINT UNSIGNED NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  INDEX idx_refund_patient (patient_id),
  CONSTRAINT fk_ref_patient_billing FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS billing_package (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(40)  NOT NULL UNIQUE,
  name         VARCHAR(120) NOT NULL,
  description  VARCHAR(500) NULL,
  amount       DECIMAL(12,2) NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS billing_tpa (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  contact_person VARCHAR(80) NULL,
  email        VARCHAR(160) NULL,
  phone        VARCHAR(20)  NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================================
-- QUALITY SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS quality_incident (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NULL,
  reported_by  BIGINT UNSIGNED NOT NULL,
  incident_type VARCHAR(60) NOT NULL,
  description  VARCHAR(500) NOT NULL,
  severity     VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
  reported_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
  INDEX idx_incident_type (incident_type),
  INDEX idx_incident_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quality_infection (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT UNSIGNED NOT NULL,
  infection_type VARCHAR(80) NOT NULL,
  organism     VARCHAR(120) NULL,
  recorded_by  BIGINT UNSIGNED NOT NULL,
  recorded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_infection_type (infection_type),
  CONSTRAINT fk_inf_patient FOREIGN KEY (patient_id) REFERENCES patient_patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quality_needle_stick (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  staff_id     BIGINT UNSIGNED NOT NULL,
  injury_date  DATETIME NOT NULL,
  exposure_source VARCHAR(120) NOT NULL,
  pep_initiated TINYINT(1) NOT NULL DEFAULT 0,
  reported_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ns_date (injury_date)
) ENGINE=InnoDB;

-- =============================================================================
-- HR SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS hr_staff (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id  VARCHAR(40)  NOT NULL UNIQUE,
  first_name   VARCHAR(80)  NOT NULL,
  last_name    VARCHAR(80)  NOT NULL,
  designation  VARCHAR(80)  NOT NULL,
  department   VARCHAR(80)  NOT NULL,
  phone        VARCHAR(20)  NULL,
  email        VARCHAR(160) NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hr_attendance (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  staff_id     BIGINT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'PRESENT',
  marked_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_att_date (attendance_date),
  CONSTRAINT fk_att_staff FOREIGN KEY (staff_id) REFERENCES hr_staff(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hr_leave (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  staff_id     BIGINT UNSIGNED NOT NULL,
  leave_type   VARCHAR(40)  NOT NULL,
  from_date    DATE NOT NULL,
  to_date      DATE NOT NULL,
  reason       VARCHAR(300) NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  approved_at  DATETIME NULL,
  approved_by  BIGINT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leave_status (status),
  CONSTRAINT fk_leave_staff FOREIGN KEY (staff_id) REFERENCES hr_staff(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- ASSETS SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS asset_register (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  asset_code   VARCHAR(40)  NOT NULL UNIQUE,
  asset_name   VARCHAR(120) NOT NULL,
  category     VARCHAR(60)  NOT NULL,
  location     VARCHAR(120) NOT NULL,
  serial_no    VARCHAR(80)  NULL,
  purchase_date DATE NOT NULL,
  purchase_cost DECIMAL(12,2) NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_asset_status (status),
  INDEX idx_asset_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asset_maintenance (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  asset_id     BIGINT UNSIGNED NOT NULL,
  maintenance_type VARCHAR(60) NOT NULL,
  requested_by BIGINT UNSIGNED NOT NULL,
  request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
  completed_at DATETIME NULL,
  notes        VARCHAR(500) NULL,
  INDEX idx_maint_status (status),
  CONSTRAINT fk_maint_asset FOREIGN KEY (asset_id) REFERENCES asset_register(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- REPORTING SERVICE
-- =============================================================================

CREATE TABLE IF NOT EXISTS reporting_custom_report (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  description  VARCHAR(500) NULL,
  query        TEXT NOT NULL,
  created_by   BIGINT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB;
