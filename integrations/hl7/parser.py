#!/usr/bin/env python3
"""
Minimal HL7 v2.x ORU^R01 parser used for reference and unit tests.

Usage:
    python parser.py sample.hl7
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from typing import List


FIELD_SEP = "|"
COMP_SEP  = "^"


@dataclass
class Observation:
    set_id: str
    value_type: str
    obs_id: str
    obs_name: str
    value: str
    unit: str
    ref_range: str
    abnormal_flag: str


@dataclass
class ORU:
    sending_app: str
    sending_facility: str
    message_control_id: str
    patient_mrn: str
    patient_name: str
    order_number: str
    test_code: str
    test_name: str
    observations: List[Observation] = field(default_factory=list)


def parse_oru(text: str) -> ORU:
    segments = [s for s in text.replace("\r\n", "\n").replace("\r", "\n").split("\n") if s.strip()]
    oru = ORU("", "", "", "", "", "", "", "")

    for seg in segments:
        fields = seg.split(FIELD_SEP)
        seg_id = fields[0]
        if seg_id == "MSH":
            oru.sending_app        = fields[2]
            oru.sending_facility   = fields[3]
            oru.message_control_id = fields[9] if len(fields) > 9 else ""
        elif seg_id == "PID":
            if len(fields) > 3: oru.patient_mrn = fields[3]
            if len(fields) > 5:
                parts = fields[5].split(COMP_SEP)
                oru.patient_name = " ".join(reversed([p for p in parts if p]))
        elif seg_id == "OBR":
            if len(fields) > 3: oru.order_number = fields[3]
            if len(fields) > 4:
                parts = fields[4].split(COMP_SEP)
                oru.test_code = parts[0]
                oru.test_name = parts[1] if len(parts) > 1 else ""
        elif seg_id == "OBX":
            obs_id_parts = fields[3].split(COMP_SEP) if len(fields) > 3 else [""]
            oru.observations.append(Observation(
                set_id         = fields[1] if len(fields) > 1 else "",
                value_type     = fields[2] if len(fields) > 2 else "",
                obs_id         = obs_id_parts[0],
                obs_name       = obs_id_parts[1] if len(obs_id_parts) > 1 else "",
                value          = fields[5] if len(fields) > 5 else "",
                unit           = fields[6] if len(fields) > 6 else "",
                ref_range      = fields[7] if len(fields) > 7 else "",
                abnormal_flag  = fields[8] if len(fields) > 8 else "",
            ))
    return oru


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: parser.py <file.hl7>", file=sys.stderr)
        return 2
    with open(sys.argv[1], "r", encoding="utf-8") as fh:
        text = fh.read()
    oru = parse_oru(text)
    payload = {
        "mrn":       oru.patient_mrn,
        "name":      oru.patient_name,
        "orderNo":   oru.order_number,
        "test":      {"code": oru.test_code, "name": oru.test_name},
        "observations": [obs.__dict__ for obs in oru.observations]
    }
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
