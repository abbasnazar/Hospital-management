"""
Pluggable payment-gateway provider used as a reference.
Implementations:
    - mock (offline; deterministic)
    - stripe / razorpay (stubbed — credentials required)
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
import uuid
from typing import Dict, Protocol


class PaymentProvider(Protocol):
    name: str
    def create_session(self, invoice_id: str, amount: float, currency: str) -> Dict: ...
    def verify_callback(self, payload: Dict, signature: str) -> bool: ...
    def refund(self, txn_ref: str, amount: float) -> Dict: ...


class MockProvider:
    name = "mock"

    def __init__(self, secret: str = "mock-secret"):
        self.secret = secret.encode()

    def _sign(self, payload: Dict) -> str:
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hmac.new(self.secret, raw, hashlib.sha256).hexdigest()

    def create_session(self, invoice_id: str, amount: float, currency: str = "INR") -> Dict:
        session = {
            "id":        f"mock_{uuid.uuid4().hex[:12]}",
            "invoiceId": invoice_id,
            "amount":    amount,
            "currency":  currency,
            "status":    "CREATED",
            "createdAt": int(time.time()),
        }
        session["signature"] = self._sign(session)
        return session

    def verify_callback(self, payload: Dict, signature: str) -> bool:
        expected = self._sign({k: v for k, v in payload.items() if k != "signature"})
        return hmac.compare_digest(expected, signature)

    def refund(self, txn_ref: str, amount: float) -> Dict:
        return {"txnRef": txn_ref, "refundedAmount": amount, "status": "REFUNDED"}


def get_provider() -> PaymentProvider:
    name = os.getenv("HMIS_PAYMENT_PROVIDER", "mock").lower()
    if name == "mock":
        return MockProvider(os.getenv("HMIS_PAYMENT_SECRET", "mock-secret"))
    raise NotImplementedError(
        f"Provider '{name}' is not implemented here. Install its SDK and implement the "
        f"PaymentProvider protocol."
    )
