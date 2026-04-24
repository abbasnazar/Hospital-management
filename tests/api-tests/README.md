# API Tests

Postman-driven contract tests live under `testing-tools/postman_collection.json`.
Run them via Newman:

```bash
newman run ../../testing-tools/postman_collection.json \
  --env-var "baseUrl=http://localhost:8080"
```

Or via the root runner:

```bash
./testing-tools/test_runner.sh
```
