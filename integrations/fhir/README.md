# FHIR R4 Integration

HMIS exposes a FHIR R4 façade that translates to/from internal microservice REST APIs.

## Supported Resources (v1)

| FHIR Resource        | Maps to                                |
|----------------------|----------------------------------------|
| `Patient`            | `patient-service` — patient            |
| `Appointment`        | `patient-service` — appointment        |
| `Observation`        | `lab-service` — lab_result             |
| `MedicationRequest`  | `pharmacy-service` — prescription_item |
| `ServiceRequest`     | `lab-service` — lab_order              |

## Examples

### `Patient` representation

See `patient_r4.json`.

### Mapping rules (Patient → HMIS)

| FHIR path                      | HMIS field               |
|--------------------------------|--------------------------|
| `identifier[0].value`          | `mrn`                    |
| `name[0].given[0]`             | `firstName`              |
| `name[0].family`               | `lastName`               |
| `birthDate`                    | `dob`                    |
| `gender`                       | `gender` (M/F/O)         |
| `telecom[system=phone].value`  | `phone`                  |
| `telecom[system=email].value`  | `email`                  |
| `address[0].text`              | `address`                |

## Conformance

This is a minimal façade, not a certified FHIR server. For production, consider HAPI FHIR (JPA server) or Firely Server.
