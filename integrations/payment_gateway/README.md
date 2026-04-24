# Payment Gateway Integration

Provider-agnostic adapter. Implements one provider (**mock**) for local development and stubs for Stripe and Razorpay.

## Interface

Every provider implements:

```python
class PaymentProvider(Protocol):
    def create_session(self, invoice_id: str, amount: float, currency: str) -> dict: ...
    def verify_callback(self, payload: dict, signature: str) -> bool: ...
    def refund(self, txn_ref: str, amount: float) -> dict: ...
```

## Webhook / callback

Providers POST a signed payload to `/api/v1/payments/webhooks/<provider>`. The billing service verifies the signature and idempotently updates the `payment` row.

## Local dev

```bash
export HMIS_PAYMENT_PROVIDER=mock
```

The **mock** provider returns a pre-canned success response and an HS256-signed "signature" based on the shared secret, allowing offline end-to-end tests.
