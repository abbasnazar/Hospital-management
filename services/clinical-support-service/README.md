# Clinical Support Service

Provides clinical decision support, drug interaction checking, contraindication verification, and dosage guidelines.

## Features

- Drug-drug interaction checking
- Allergy and contraindication verification
- Dosage guidelines and special population adjustments
- Prescribing audit trail and clinical audit logs
- Evidence-based clinical decision support

## Endpoints

```
POST   /api/v1/clinical/check-interactions           — Check drug interactions
POST   /api/v1/clinical/check-contraindications      — Check contraindications
GET    /api/v1/clinical/dosage-guidelines/{drugCode} — Get dosage guidelines
GET    /api/v1/clinical/audit-trail/{doctorId}      — Get prescribing audit
POST   /api/v1/clinical/allergy-alert                — Check allergy alerts
```

## Database Schema

### clinical_drug_interaction
- Pre-populated database of known drug-drug interactions
- Severity levels (LOW, MODERATE, HIGH, CRITICAL)
- Clinical descriptions and management recommendations

### clinical_contraindication
- Medicine-to-condition contraindications
- Renal and hepatic adjustments
- Special populations (pregnancy, pediatrics, elderly)

### clinical_audit_log
- Immutable log of all prescribing decisions
- Tracks what drugs were checked and by whom
- Compliance with clinical governance

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
docker build -t clinical-support-service .
docker run -p 3008:3008 clinical-support-service
```

## RBAC

- **DOCTOR**: Can access all clinical support features
- **PHARMACIST**: Can check interactions, dosage
- **NURSE**: Can view dosage guidelines (read-only)

## Data Model

### Drug Interaction Levels
- **NONE**: No interaction
- **LOW**: Minimal interaction, monitor
- **MODERATE**: Potential interaction, may require adjustment
- **HIGH**: Significant interaction, avoid if possible
- **CRITICAL**: Contraindicated combination

### Severity Ratings
- **MILD**: Low risk
- **MODERATE**: Medium risk
- **SEVERE**: High risk
- **CRITICAL**: Life-threatening

## Integration Points

- **Prescription Service**: Real-time interaction checking
- **Medical Records**: Patient allergy verification
- **Pharmacy Service**: Dispensing verification
