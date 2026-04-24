"""Billing module — integration tests."""

from __future__ import annotations

import requests

from tests.conftest import auth_headers  # type: ignore


def test_invoice_and_payment(host, receptionist_token, unique_patient):
    invoice_body = {
        "patientId": unique_patient["id"],
        "items": [
            {"itemType": "CONSULT", "description": "OPD Consult",
             "qty": 1, "unitPrice": 500, "tax": 90},
        ],
    }
    inv = requests.post(
        f"{host}/api/v1/invoices",
        headers=auth_headers(receptionist_token),
        json=invoice_body,
        timeout=15,
    )
    assert inv.status_code in (200, 201), inv.text
    invoice = inv.json()
    assert invoice["totalAmount"] >= 590

    pay = requests.post(
        f"{host}/api/v1/payments",
        headers=auth_headers(receptionist_token),
        json={
            "invoiceId": invoice["id"],
            "method":    "UPI",
            "amount":    invoice["totalAmount"],
            "txnRef":    "UPI/test/001",
        },
        timeout=15,
    )
    assert pay.status_code in (200, 201)
    assert pay.json()["status"] in ("CAPTURED", "SUCCESS")
