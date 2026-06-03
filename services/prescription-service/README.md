# Prescription Service

Manages prescriptions, prescription items, and approval workflows for doctor's clinical decisions.

## Features

- Create and manage prescriptions with multiple medicine items
- Sign/approve prescriptions with audit trail
- Modify prescriptions before dispensing
- Cancel prescriptions with documentation
- Add clinical notes and justifications
- Track prescription history per patient

## Endpoints

```
POST   /api/v1/prescriptions                — Create prescription
GET    /api/v1/prescriptions/{id}           — Get prescription details
PUT    /api/v1/prescriptions/{id}           — Modify prescription
POST   /api/v1/prescriptions/{id}/sign      — Sign prescription
POST   /api/v1/prescriptions/{id}/cancel    — Cancel prescription
POST   /api/v1/prescriptions/{id}/notes/add — Add clinical notes
GET    /api/v1/prescriptions/patient/{id}   — Get prescription history
```

## Database Schema

### prescription_prescription
- Stores main prescription record with status tracking
- Links to encounter, patient, and doctor
- Tracks clinical notes and approval workflow

### prescription_item
- Stores each medicine item in prescription
- Contains dose, frequency, duration, quantity
- Links clinical reason for recommendation

### prescription_approval_log
- Immutable audit trail of all actions
- Tracks who did what and when

## Environment Variables

```
PORT=3008
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
docker build -t prescription-service .
docker run -p 3008:3008 prescription-service
```

## RBAC

- **DOCTOR**: Can create, modify, sign, cancel prescriptions; add notes
- **PHARMACIST**: Can view prescriptions
- **PATIENT**: Can view own prescriptions

## Integration Points

- **Lab Service**: Verify lab test recommendations
- **Clinical Support**: Check drug interactions
- **Medical Records**: Access patient allergies
- **Pharmacy Service**: Prescription fulfilment
- **Billing Service**: Invoice generation
