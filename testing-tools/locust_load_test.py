"""
HMIS — Locust load test.

Run headless:
    locust -f testing-tools/locust_load_test.py --headless -u 50 -r 10 -t 2m \\
           --host http://localhost:8080

Interactive:
    locust -f testing-tools/locust_load_test.py --host http://localhost:8080
"""

from __future__ import annotations

import os
import random
import uuid

from locust import HttpUser, between, task


class HmisUser(HttpUser):
    wait_time = between(0.5, 2.0)
    host      = os.getenv("HMIS_HOST", "http://localhost:8080")
    token     = None
    patient_id = None

    def on_start(self):
        resp = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": os.getenv("HMIS_USER", "drrao"),
                "password": os.getenv("HMIS_PASS", "password"),
            },
            name="auth:login",
        )
        if resp.status_code == 200:
            self.token = resp.json().get("accessToken")

    def headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def list_patients(self):
        self.client.get(
            "/api/v1/patients?page=0&size=20",
            headers=self.headers(),
            name="patient:list",
        )

    @task(2)
    def register_patient(self):
        uid = uuid.uuid4().hex[:8]
        body = {
            "firstName": f"L{uid}",
            "lastName":  f"Test-{uid}",
            "dob":       "1995-06-15",
            "gender":    random.choice(["M", "F"]),
            "phone":     f"+9198{random.randint(10000000, 99999999)}",
        }
        resp = self.client.post(
            "/api/v1/patients",
            json=body,
            headers=self.headers(),
            name="patient:create",
        )
        if resp.status_code == 201:
            self.patient_id = resp.json().get("id")

    @task(1)
    def daily_mis(self):
        self.client.get(
            "/api/v1/reports/mis/daily?site=MAIN&date=2026-04-23",
            headers=self.headers(),
            name="reports:mis",
        )

    @task(1)
    def create_invoice(self):
        if not self.patient_id:
            return
        body = {
            "patientId": self.patient_id,
            "items": [
                {"itemType": "CONSULT", "description": "Consult",
                 "qty": 1, "unitPrice": 500, "tax": 90}
            ],
        }
        self.client.post(
            "/api/v1/invoices",
            json=body,
            headers=self.headers(),
            name="billing:invoice:create",
        )
