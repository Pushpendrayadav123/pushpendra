# Backend

Node.js and Express API backed by MongoDB through Mongoose.

## Setup

1. Install Node.js 20 or newer and start a local MongoDB instance, or get a MongoDB connection URI.
2. From this directory, install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection URI.
4. Start the API:

   ```sh
   npm run dev
   ```

The API listens on port 5000 by default. `GET /api/health` reports the API and MongoDB connection status. Set `PORT` or `CLIENT_URL` in `.env` to override the defaults.

## Employee API

- `GET /api/employees` — list employees; optional `q` and `status` query parameters filter results.
- `POST /api/employees` — create an employee.
- `GET /api/employees/:id` — get employee details.
- `PUT /api/employees/:id` — update an employee.
- `DELETE /api/employees/:id` — delete an employee.

Employee records require `firstName`, `lastName`, `email`, `department`, `position`, and `startDate`. Email addresses are unique. Status is `Active`, `On leave`, or `Inactive`; employment type is `Full-time`, `Part-time`, `Contract`, or `Intern`.
