# Load Tests

Locust-based load profiles live at `testing-tools/locust_load_test.py`.

```bash
locust -f ../../testing-tools/locust_load_test.py \
       --headless -u 50 -r 10 -t 2m \
       --host http://localhost:8080
```

## Target SLOs

| Endpoint                | p95 latency | Throughput           |
|-------------------------|-------------|----------------------|
| POST /auth/login        | < 300 ms    | 100 rps sustained    |
| GET  /patients          | < 400 ms    | 300 rps sustained    |
| POST /patients          | < 500 ms    | 50 rps sustained     |
| POST /invoices          | < 600 ms    | 80 rps sustained     |
