# Medical Records Service

Provides comprehensive access to patient medical history, allergies, medications, documents, and vital signs.

## Features

- Complete patient medical record aggregation
- Allergy management with severity tracking
- Medical document storage (X-rays, ECG, etc.)
- Medication history tracking
- Consultation history retrieval
- Vital signs management
- Clinical notes access

## Endpoints

```
GET    /api/v1/patients/{id}/complete-record    — Get full medical history
GET    /api/v1/patients/{id}/allergies          — Get allergies
POST   /api/v1/patients/{id}/allergies          — Add allergy record
GET    /api/v1/patients/{id}/medications        — Get medication history
GET    /api/v1/patients/{id}/diagnoses          — Get diagnosis history
GET    /api/v1/patients/{id}/consultations      — Get consultation history
GET    /api/v1/patients/{id}/documents          — Get medical documents
POST   /api/v1/patients/{id}/documents          — Upload document
GET    /api/v1/patients/{id}/vitals             — Get vital signs history
```

## Database Schema

### medical_record_document
- Stores references to uploaded documents (S3/GCS)
- Document type classification (XRAY, ECG, CT, etc.)
- Metadata about uploader

### patient_allergy
- Allergy records with reaction type and severity
- Documented by clinician
- Immutable audit trail

## Environment Variables

```
PORT=3007
DB_HOST=mysql
DB_NAME=hmis
DB_USER=hmis
DB_PASS=hmis
JWT_SECRET=your-secret-key
```

## Build & Run

```bash
npm install
npm run dev          # Development with nodemon
npm run test         # Run tests
docker build -t medical-records-service .
docker run -p 3007:3007 medical-records-service
```

## RBAC

- **DOCTOR**: Can view, add allergies; view all records
- **NURSE**: Can view, add allergies
- **PHARMACIST**: Can view allergies
- **PATIENT**: Can view own records
- **LAB_TECH**: Can view lab-related documents

## Integration Points

- **Clinical Support**: Cross-reference drug allergies
- **Prescription Service**: Verify allergy before prescribing
- **Patient Service**: Base patient demographics
- **Doctor Service**: Clinical notes
- **Lab Service**: Lab results
