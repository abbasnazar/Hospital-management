"""Patient module — integration tests."""

from __future__ import annotations

import uuid

import requests

from tests.conftest import auth_headers  # type: ignore


def test_create_and_fetch_patient(host, receptionist_token):
    uid = uuid.uuid4().hex[:8]
    body = {
        "firstName": f"Int{uid}",
        "lastName":  "Patient",
        "dob":       "1985-03-22",
        "gender":    "F",
        "phone":     f"+9198{uuid.uuid4().int % 100000000:08d}",
    }
    r = requests.post(
        f"{host}/api/v1/patients",
        headers=auth_headers(receptionist_token),
        json=body,
        timeout=15,
    )
    assert r.status_code in (200, 201), r.text
    pid = r.json()["id"]

    g = requests.get(
        f"{host}/api/v1/patients/{pid}",
        headers=auth_headers(receptionist_token),
        timeout=15,
    )
    assert g.status_code == 200
    assert g.json()["firstName"] == body["firstName"]


def test_duplicate_patient_is_conflict(host, receptionist_token, unique_patient):
    body = {
        "firstName": unique_patient["firstName"],
        "lastName":  unique_patient["lastName"],
        "dob":       unique_patient["dob"],
        "gender":    unique_patient["gender"],
        "phone":     unique_patient.get("phone"),
    }
    r = requests.post(
        f"{host}/api/v1/patients",
        headers=auth_headers(receptionist_token),
        json=body,
        timeout=15,
    )
    assert r.status_code in (409, 400)


def test_patient_search(host, receptionist_token, unique_patient):
    q = unique_patient["lastName"][:5]
    r = requests.get(
        f"{host}/api/v1/patients?q={q}",
        headers=auth_headers(receptionist_token),
        timeout=15,
    )
    assert r.status_code == 200
    data = r.json()
    content = data.get("content", data)
    assert any(p["id"] == unique_patient["id"] for p in content)
