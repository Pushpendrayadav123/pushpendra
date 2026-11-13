Employee Management

Responsive employee directory built with React and Vite. Employee records are stored in MongoDB through the Express API.

## Run locally

1. Follow the setup in `../backend/README.md` and start the backend with `npm run dev`.
2. In this directory, install dependencies and start the frontend:

   ```sh
   npm install
   npm run dev
   ```

3. If the API is not at `http://localhost:5000/api`, copy `.env.example` to `.env` and set `VITE_API_URL` to the API base URL.

The employee dashboard supports adding, searching, filtering, viewing, editing, and deleting employee records.
