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
