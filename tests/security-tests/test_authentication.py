"""Authentication tests — login, token validity, expiry."""

from __future__ import annotations

import base64
import json

import requests


def _decode_jwt_payload(token: str) -> dict:
    payload_b64 = token.split(".")[1]
    payload_b64 += "=" * (-len(payload_b64) % 4)
    return json.loads(base64.urlsafe_b64decode(payload_b64).decode())


def test_login_happy_path(host):
    r = requests.post(
        f"{host}/api/v1/auth/login",
        json={"username": "drrao", "password": "password"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    tok = r.json()["accessToken"]
    assert isinstance(tok, str) and tok.count(".") == 2


def test_login_rejects_bad_password(host):
    r = requests.post(
        f"{host}/api/v1/auth/login",
        json={"username": "drrao", "password": "wrong"},
        timeout=15,
    )
    assert r.status_code in (401, 400)


def test_login_rejects_unknown_user(host):
    r = requests.post(
        f"{host}/api/v1/auth/login",
        json={"username": "no-such-user-xxxx", "password": "whatever"},
        timeout=15,
    )
    assert r.status_code in (401, 400)


def test_protected_endpoint_requires_token(host):
    r = requests.get(f"{host}/api/v1/patients", timeout=15)
    assert r.status_code == 401


def test_invalid_token_rejected(host):
    r = requests.get(
        f"{host}/api/v1/patients",
        headers={"Authorization": "Bearer this.is.not.valid"},
        timeout=15,
    )
    assert r.status_code == 401


def test_jwt_has_expected_claims(doctor_token):
    payload = _decode_jwt_payload(doctor_token)
    assert "sub" in payload
    assert "exp" in payload
    assert "iss" in payload
    assert "roles" in payload
