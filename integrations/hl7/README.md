# HL7 v2.x Integration

## Overview

HMIS accepts HL7 v2.x messages from external systems (primarily lab analysers) over MLLP/TCP. The adapter is intentionally kept minimal and framework-agnostic — adopt HAPI HL7 (`ca.uhn.hapi:hapi-base`) in production.

Supported message types (inbound):

- **ADT^A01/A04/A08** → patient ADT events
- **ORM^O01**          → lab orders
- **ORU^R01**          → lab results

## Wire Format (MLLP)

Each message is framed by:

```
<VT> <HL7 message> <FS> <CR>
```

with `VT=0x0B`, `FS=0x1C`, `CR=0x0D`.

## Example ORU^R01

```
MSH|^~\&|ANALYSER|LAB|HMIS|HOSP|20260423083000||ORU^R01|MSG00001|P|2.5
PID|1||H001-2026-000101||Patel^Meera||19900514|F
OBR|1||ORD-9001|CBC^Complete Blood Count
OBX|1|NM|HGB^Haemoglobin||12.8|g/dL|12-17|N|||F
OBX|2|NM|WBC^WBC Count||6.1|10*3/uL|4-11|N|||F
```

## Reference parser

See `parser.py` for a dependency-free demonstration of parsing ORU^R01 into Python dicts that can be published to the `lab.results` Kafka topic.

```bash
python parser.py sample.hl7
```

## Mapping to HMIS

| HL7 field         | HMIS field                      |
|-------------------|---------------------------------|
| PID-3             | `patient.mrn`                   |
| OBR-3             | `lab_order.id` (external ref)   |
| OBX-3             | `lab_test.loinc` / code         |
| OBX-5             | `lab_result.value`              |
| OBX-6             | `lab_result.unit`                |
| OBX-8             | `lab_result.flag`                |
