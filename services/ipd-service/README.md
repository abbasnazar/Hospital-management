# IPD Service (In-Patient Department)

Manages hospital admissions, bed assignments, ward census, and patient discharge for in-patient care workflows.

## Features

- Patient admission management (emergency and planned)
- Bed assignment and ward management
- Real-time ward occupancy tracking
- Patient discharge with summary documentation
- Follow-up appointment scheduling
- Ward census reports

## Endpoints

```
POST   /api/v1/ipd/admissions                         — Create admission
GET    /api/v1/ipd/admissions/{id}                   — Get admission details
POST   /api/v1/ipd/bed-assignment                     — Assign bed to patient
POST   /api/v1/ipd/discharges                         — Discharge patient
GET    /api/v1/ipd/ward/{wardId}/census               — Get ward occupancy
GET    /api/v1/ipd/wards                              — Get all wards status
GET    /api/v1/ipd/patients/{patientId}/current-admission  — Get current admission
```

## Database Schema

### ipd_ward
- Hospital ward definitions (ICU, General Ward, etc.)
- Bed capacity per ward
- Active/inactive status

### ipd_bed
- Individual bed records
- Linked to ward
- Status tracking (AVAILABLE, OCCUPIED, MAINTENANCE)

### ipd_admission
- Patient admission record
- Links patient to doctor and bed
- Admission type (EMERGENCY, PLANNED)
- Expected length of stay

### ipd_discharge
- Discharge records with summary
- Discharge type (HOME, TRANSFER, ABSCONDED, DECEASED)
- Follow-up date scheduling

## Environment Variables

```
PORT=3009
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
docker build -t ipd-service .
docker run -p 3009:3009 ipd-service
```

## RBAC

- **DOCTOR**: Can create admissions, discharge patients
- **NURSE**: Can assign beds, view census, view admissions
- **ADMIN**: Full access to ward management
- **RECEPTIONIST**: Can view availability

## Ward Management

### Typical Ward Setup
- **ICU**: 10 beds (critical care)
- **General Ward**: 30 beds (routine care)
- **Isolation**: 5 beds (infectious diseases)
- **Pediatrics**: 15 beds (children)

## Integration Points

- **Patient Service**: Patient demographics
- **Doctor Service**: Clinical notes and discharge summaries
- **Billing Service**: Generate charges for bed/room
- **Notification Service**: Notification of admission/discharge
- **Reporting Service**: Census and occupancy reports
