"""Shared PyTest fixtures for HMIS integration/security tests."""

from __future__ import annotations

import os
import uuid
from typing import Dict, Optional

import pytest
import requests


HOST = os.getenv("HMIS_HOST", "http://localhost:8080")
DEFAULT_TIMEOUT = 15


# --- Helpers ------------------------------------------------------------------

def login(username: str, password: str = "password") -> Optional[str]:
    try:
        r = requests.post(
            f"{HOST}/api/v1/auth/login",
            json={"username": username, "password": password},
            timeout=DEFAULT_TIMEOUT,
        )
    except requests.exceptions.RequestException as exc:
        pytest.skip(f"HMIS gateway unreachable at {HOST}: {exc}")
    if r.status_code != 200:
        return None
    return r.json().get("accessToken")


def auth_headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --- Fixtures -----------------------------------------------------------------

@pytest.fixture(scope="session")
def host() -> str:
    return HOST


@pytest.fixture(scope="session")
def doctor_token() -> str:
    tok = login("drrao")
    if tok is None:
        pytest.skip("Could not log in as drrao — seed data missing?")
    return tok


@pytest.fixture(scope="session")
def receptionist_token() -> str:
    tok = login("priya")
    if tok is None:
        pytest.skip("Could not log in as priya — seed data missing?")
    return tok


@pytest.fixture(scope="session")
def lab_tech_token() -> str:
    tok = login("rakesh")
    if tok is None:
        pytest.skip("Could not log in as rakesh — seed data missing?")
    return tok


@pytest.fixture
def unique_patient(receptionist_token: str) -> Dict:
    uid = uuid.uuid4().hex[:8]
    body = {
        "firstName": f"IT{uid}",
        "lastName":  f"User-{uid}",
        "dob":       "1990-01-01",
        "gender":    "M",
        "phone":     f"+9198{uuid.uuid4().int % 100000000:08d}",
    }
    r = requests.post(
        f"{HOST}/api/v1/patients",
        headers=auth_headers(receptionist_token),
        json=body,
        timeout=DEFAULT_TIMEOUT,
    )
    assert r.status_code in (200, 201), r.text
    return r.json()
