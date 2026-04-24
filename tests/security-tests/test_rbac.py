"""RBAC / permission tests — role boundary enforcement."""

from __future__ import annotations

import requests

from tests.conftest import auth_headers, login  # type: ignore


def test_patient_cannot_list_patients(host):
    tok = login("meera")
    if tok is None:
        import pytest
        pytest.skip("Patient user 'meera' not in seed data")
    r = requests.get(
        f"{host}/api/v1/patients",
        headers=auth_headers(tok),
        timeout=15,
    )
    assert r.status_code in (403, 401)


def test_pharmacist_cannot_create_clinical_note(host):
    tok = login("sara")
    if tok is None:
        import pytest
        pytest.skip("Pharmacist 'sara' not in seed data")
    r = requests.post(
        f"{host}/api/v1/clinical/notes",
        headers=auth_headers(tok),
        json={"encounterId": 1, "patientId": 1, "note": {"s": "h/o"}},
        timeout=15,
    )
    assert r.status_code in (403, 401)


def test_receptionist_cannot_approve_lab_results(host):
    tok = login("priya")
    if tok is None:
        import pytest
        pytest.skip("Receptionist 'priya' not in seed data")
    r = requests.post(
        f"{host}/api/v1/lab/results",
        headers=auth_headers(tok),
        json={"sampleId": 1, "analyteCode": "HB", "value": "13.5"},
        timeout=15,
    )
    assert r.status_code in (403, 401)


def test_doctor_can_list_patients(doctor_token, host):
    r = requests.get(
        f"{host}/api/v1/patients?page=0&size=5",
        headers=auth_headers(doctor_token),
        timeout=15,
    )
    assert r.status_code == 200


def test_lab_tech_can_access_lab(lab_tech_token, host):
    r = requests.get(
        f"{host}/api/v1/lab/orders?status=ORDERED",
        headers=auth_headers(lab_tech_token),
        timeout=15,
    )
    assert r.status_code in (200, 404)
