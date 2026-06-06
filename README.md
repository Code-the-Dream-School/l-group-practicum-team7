# PulseMind

PulseMind is a full-stack burnout tracking and wellness companion that helps users notice early signs of emotional and physical exhaustion. The app monitors stress, workload, sleep, and energy, then turns those daily signals into insights, dialogue guidance, and reflection tools.

## Project Purpose

Burnout often builds gradually before it becomes obvious. PulseMind is designed for students, workers, and anyone balancing daily responsibilities who wants a practical way to track their state and respond before exhaustion becomes severe.

The project focuses on prevention: users log a short daily check-in, review patterns over time, and receive recommendations that connect their data to small actions they can take.

## Features

- User authentication with register, login, logout, and protected API routes
- Daily entry tracking for stress, workload, sleep hours, and energy
- Burnout score calculation and risk classification
- Dashboard summaries for current burnout risk, trends, averages, and additional signals
- History view for reviewing previous daily entries
- Mascot dialogue system that recommends conversation branches based on recent patterns
- Reflection tools unlocked through dialogue choices
- User-specific tool history and local storage isolation
- Subscription/demo checkout flow for premium status
- Responsive frontend UI for desktop and mobile layouts

## Key Wellness Areas

- **Vital Tracking:** monitor stress, sleep, workload, and energy over time.
- **Workload Management:** identify when daily responsibilities are becoming too heavy.
- **Smart Recommendations:** receive personalized prompts and actions based on recent entries.
- **Preventative Analytics:** review visual trends and averages before burnout escalates.
- **Dialogue Support:** talk through stress, workload, sleep deprivation, and low energy with a mascot-guided flow.
- **Reflection Tools:** use short writing, planning, grounding, breathing, and recovery exercises.

## Tech Stack

### Frontend

- React
- JavaScript / TypeScript
- Vite
- CSS
- Lucide React icons

### Backend

- Node.js
- Express.js
- REST API
- JWT authentication

### Database

- MongoDB
- Mongoose

### Tooling

- npm
- dotenv
- Git / GitHub

## Project Structure

```text
project-root/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

### Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in `backend/`:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Backend default URL:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional frontend `.env`:

```env
VITE_API_BASE=http://localhost:8080
```

Frontend default URL:

```text
http://localhost:5173
```

## API Overview

Common backend route groups include:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/entries
POST   /api/entries
DELETE /api/entries/:id

GET /api/insights

GET  /api/dialogues/available
GET  /api/dialogues/tools
POST /api/dialogues/tools/unlock

GET  /api/subscription/me
POST /api/subscription/demo-checkout
POST /api/subscription/demo-reset
```

Some endpoint names may vary slightly depending on the active backend branch. Check `backend/src/routes/` for the source of truth.

## Development Notes

- Do not use production or development MongoDB data for automated tests.
- Keep user-specific dialogue and tool data isolated by account.
- The frontend stores some dialogue/tool state locally for responsiveness, but premium status and protected data should be confirmed by the backend.
- Dialogue branches unlock reflection tools and should avoid replaying completed non-repeatable tool unlocks.

## Team

- Alikhan Amanzhanov
- Eric Vasquez-Reyes
- Mauricio
- Natalia Novikova
- Tegegnwork Checol

## Future Improvements

- Expand automated backend and frontend test coverage
- Improve validation and error consistency across API routes
- Add more advanced user-specific dialogue memory
- Improve accessibility and keyboard navigation
- Add deployment documentation
- Add pet feature

## License

This project is for educational purposes.
