# VedaAI Assessment Creator

AI-powered assessment creation platform for teachers.

login credential:
mail - vedaai@gmail.com
password - Ping_pong29

deployed link - https://vedaai.cooldash.xyz/assignments

demo video - https://drive.google.com/file/d/1T2Gk1ItjD4aXjr8q9vYnFa7iY0QYJZHz/view

small favor - since i am using a free gemini api key, i can only use 8000 max tokens in the gemini config, so please dont increase the amount of questions in form because it will fail to do so because of limited questions. If you want to increase the amount of questions, you can use your own api key and increase the max tokens in gemini config.

## Quick Start

Install dependencies (from root):

```bash
bun run install:all
```

```bash
bun run install
```

second bun run install is for installing concurrency package in the root folder

Start development server (from root):

```bash
bun run dev
```

This runs both frontend (port 3000) and backend (port 3001) concurrently using `concurrently`.

## Environment Variables

Create `.env` files from the provided `.env.example`.

### Backend (`backend/.env`)

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection (e.g. `redis://localhost:6379`)
- `JWT_SECRET` — Long random string for auth token signing
- `GOOGLE_API_KEY` — Google Gemini API key for AI generation
- `FRONTEND_URL` — Frontend domain (for CORS)

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL` — Backend API URL (e.g. `http://localhost:3001/api`)

## System Architecture

### Frontend

- **Next.js 16 + TypeScript** with App Router
- **Tailwind CSS** for styling
- **Zustand** for client state management
- **Axios** for API communication
- Mobile-first responsive design

### Backend

- **Node.js + Express + TypeScript**
- **PostgreSQL** via Prisma ORM
- **Redis** for BullMQ job queues
- **BullMQ** workers for background AI processing
- **Google Gemini** for question generation
- **JWT** authentication with HTTP-only cookies

### Data Flow

1. Teacher fills assignment form (subject, school, class, duration, due date, question types with count/marks)
2. Frontend POSTs to `/api/assignment/create`
3. Backend stores assignment in PostgreSQL with status `PENDING`
4. On "Generate Question Paper", backend creates a BullMQ job
5. Worker calls Google Gemini with structured prompt
6. Worker parses LLM response into sections/questions/difficulty/marks
7. Structured question paper stored in database
8. Frontend polls `/api/assignment/{id}` for status updates
9. On completion, frontend renders structured exam paper (not raw AI output)
10. Generated question paper can also be downloaded as PDF when you click view assignment on 3 dots.

### Database Schema

- `User` — teachers (email, password hash)
- `Assignment` — assignment metadata + question type config (JSON)
- `QuestionPaper` — generated exam with sections, questions, answer key (JSON fields)
- One-to-one relation: Assignment → QuestionPaper (cascade delete enabled)

### Docker Compose (optional)

```bash
docker-compose up
```

Spins up Redis container + backend + frontend for local deployment.

## Assignment Scope

Per the assignment requirements, **only the `/assignments` route is fully functional**:

- `/assignments` — List assignments with empty state, search, filter
- `/assignments/create` — Multi-step form to create assignments
- `/assignments/[id]` — Review assignment, generate question paper, view/download result

Other sidebar routes (Home, My Groups, AI Teacher's Toolkit, My Library) are present in the UI but do not have functional pages.
