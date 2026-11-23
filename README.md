# Student Record Management API (Set B)

REST API built with Node.js + Express. Data is stored in an in-memory array (no database), so it resets on restart.

## Setup & Run
```bash
npm install
node server.js        # or: npm start
```
Server runs at **http://localhost:3000** (a message is printed in the terminal).

## Endpoints
| Method | URL | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/students` | All students | 200 | |
| POST | `/api/students` | Create student | 201 | 400 invalid, 409 duplicate rollNumber |
| GET | `/api/students/:id` | Student by id | 200 | 404 |
| PUT | `/api/students/:id` | Update student | 200 | 400, 404, 409 |
| DELETE | `/api/students/:id` | Delete student | 200 | 404 |
| GET | `/api/students/filter?branch=CSE` | Filter by branch (case-insensitive) | 200 (empty array if none) | 400 if `branch` missing |

## Validation
`rollNumber`, `name`, `branch`: non-empty strings · `semester`: integer 1–12 · `email`: valid email format.

## Testing
Use Postman / Thunder Client, or open `requests.http` with the REST Client extension. Save screenshots in `screenshots/`.
