# Meal Planner AI

An AI-powered meal planning app. Users complete a short onboarding flow describing their goals, diet, activity level, and cooking skill, and the app generates a personalized 7-day meal plan — complete with recipes, macros, and a consolidated grocery list. Individual meals can be regenerated on demand without having to rebuild the whole week.

## Features

- **Personalized onboarding** — collects goal (lose weight, build muscle, etc.), diet type, activity level, body stats, cooking skill, budget, cuisine preferences, and restrictions/allergies.
- **AI-generated 7-day meal plan** — calorie and macro targets are calculated from a Mifflin-St Jeor BMR/TDEE estimate, then sent to an LLM to produce a full week of recipes with ingredients, instructions, and nutrition info.
- **Grocery list generation** — ingredients are consolidated across the week, grouped by category, and annotated with which meals use them.
- **Single-meal regeneration** — swap out one meal for a new one that still fits the user's targets and diet, without discarding the rest of the plan.
- **Versioned plans** — each regenerated plan is stored with an incrementing version number.
- **Auth** — user accounts and sessions via Neon Auth.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Neon Auth (`@neondatabase/neon-js`)
- lucide-react icons

**Backend**
- Node.js + Express 5
- Prisma ORM 7 (PostgreSQL)
- OpenAI API for meal plan generation
- cookie-parser, cors, dotenv

## Project Structure

```
meal-planner-ai/
├── src/                    # Frontend (Vite + React)
│   ├── pages/               # Home, Onboarding, Profile, Auth, Account
│   ├── components/
│   │   ├── meal/             # WeekView, RecipeCard, GroceryList
│   │   ├── layout/            # Navbar
│   │   └── ui/                # Reusable form/UI primitives
│   ├── context/              # AuthContext
│   └── lib/                  # api.ts, auth.ts
└── server/                 # Backend (Express + Prisma)
    ├── src/
    │   ├── routes/            # profile.ts, plan.ts
    │   └── lib/                # ai.ts (OpenAI meal plan logic), prisma.ts
    └── prisma/
        ├── schema.prisma
        └── migrations/
```

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database (also used for Neon Auth)
- An OpenAI API key

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mattusuquen/meal-planner-ai.git
cd meal-planner-ai
```

### 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:

```
DATABASE_URL=postgresql://user:password@your-project-id.us-east-2.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

Run migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the server:

```bash
npm run dev:server
```

### 3. Set up the frontend

From the project root:

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_API_URL=http://localhost:3001
VITE_NEON_AUTH_URL=https://your-project-id.neon.tech/auth
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port), talking to the API at `http://localhost:3001`.

## API Overview

| Method | Endpoint                | Description                                   |
|--------|--------------------------|------------------------------------------------|
| GET    | `/api/profile`           | Fetch a user's profile by `userId`             |
| POST   | `/api/profile`           | Create or update a user's profile              |
| POST   | `/api/plan/generate`     | Generate a new 7-day meal plan for a user      |
| GET    | `/api/plan/current`      | Fetch the user's most recent meal plan         |
| POST   | `/api/plan/refresh-meal` | Regenerate a single meal within the current plan |

## Database

Schema is managed with Prisma and lives in `server/prisma/schema.prisma`. Two core models:

- **`user_profiles`** — one row per user, storing onboarding inputs (goal, diet type, activity level, weight, height, age, restrictions, budget, etc.)
- **`meal_plans`** — versioned meal plans per user, storing both structured JSON (`plan_json`) and a text rendering (`plan_text`)

## Available Scripts

**Root (frontend)**
- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

**`server/`**
- `npm run dev:server` — start the API with hot reload (tsx watch)
- `npm run build` — deploy Prisma migrations and generate the client
- `npm start` — run the API with tsx

## License

No license specified yet.
