"""Appointment module — integration tests."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import requests

from tests.conftest import auth_headers  # type: ignore


def _slot(offset_minutes: int = 60, duration: int = 20):
    start = datetime.now(timezone.utc) + timedelta(minutes=offset_minutes)
    end   = start + timedelta(minutes=duration)
    return start.isoformat(), end.isoformat()


def test_book_appointment(host, receptionist_token, unique_patient):
    s, e = _slot()
    body = {
        "patientId": unique_patient["id"],
        "doctorId":  22,
        "slotStart": s,
        "slotEnd":   e,
        "reason":    "integration",
    }
    r = requests.post(
        f"{host}/api/v1/appointments",
        headers=auth_headers(receptionist_token),
        json=body,
        timeout=15,
    )
    assert r.status_code in (200, 201), r.text
    data = r.json()
    assert data["patientId"] == unique_patient["id"]
    assert data["status"] in ("BOOKED", "SCHEDULED")


def test_overlapping_appointment_rejected(host, receptionist_token, unique_patient):
    s, e = _slot(offset_minutes=120)
    body = {
        "patientId": unique_patient["id"],
        "doctorId":  22,
        "slotStart": s,
        "slotEnd":   e,
        "reason":    "first",
    }
    r1 = requests.post(
        f"{host}/api/v1/appointments",
        headers=auth_headers(receptionist_token),
        json=body,
        timeout=15,
    )
    assert r1.status_code in (200, 201)

    r2 = requests.post(
        f"{host}/api/v1/appointments",
        headers=auth_headers(receptionist_token),
        json={**body, "reason": "second"},
        timeout=15,
    )
    assert r2.status_code == 409
