curl -X POST http://localhost:3000/api/payments/process -H "Content-Type: application/json" -d '{"fromAccountId": 1, "toAccountId": 2, "amount": 100}'
