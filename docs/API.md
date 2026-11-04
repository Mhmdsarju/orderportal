# API Reference
All browser requests should go through `http://localhost:3000/api`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | Public | Create user and return JWT |
| POST | /auth/login | Public | Login and return JWT |
| GET | /users/me | Bearer | Current user's safe profile |
| GET | /users/:id | Admin | Fetch user safe profile |
| POST | /orders | Bearer | Create order for token subject |
| GET | /orders | Bearer | List only current user's orders |
| GET | /orders/:id | Owner | Fetch own order |
| PATCH | /orders/:id | Owner/Admin | Update order status; gRPC validates current account role |

Order status values: `pending`, `processing`, `shipped`, `delivered`.
