# DevNexus

**Code Together, Learn Together**

DevNexus is a real-time collaborative coding platform built for technical interviews and pair programming. It brings together live video calls, a synchronized code editor, instant code execution, AI-powered code reviews, and a curated problem library — all in one place.

---

## Features

- **Real-Time Collaborative Code Editor** — Monaco Editor synced across all participants via Socket.io with cursor position sharing and language switching.
- **HD Video Calls** — Face-to-face communication powered by Stream Video SDK with multi-participant support.
- **Real-Time Chat** — In-session messaging powered by Stream Chat.
- **Code Execution** — Run JavaScript, Python, and Java code directly in the browser via the Judge0 API with safety limits and timeout handling.
- **AI Code Review** — Get instant feedback on time/space complexity, optimizations, and explanations powered by Groq (LLaMA 3.3 70B).
- **Focus / Proctoring Mode** — Hosts can enable proctored mode that detects tab switches and fullscreen exits, with violation logs stored per session.
- **Session Management** — Create public or private sessions with up to 10 participants, manage problem lists, and control session flow with the Host Control Panel.
- **Rich-Text Notes** — Per-user, per-session notes with a rich text editor (React Quill), auto-saved to the database.
- **Problem Library** — A curated set of coding problems with easy, medium, and hard difficulty levels.
- **Authentication** — Secure user authentication and management via Clerk with webhook-based user sync to MongoDB.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool and dev server |
| Tailwind CSS 4 + DaisyUI 5 | Styling and component library |
| Monaco Editor | Code editor |
| Stream Video React SDK | Video calling |
| Stream Chat React | Real-time chat |
| React Router 7 | Client-side routing |
| TanStack React Query | Server state management |
| Socket.io Client | Real-time code sync |
| React Quill | Rich text editor for notes |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|---|---|
| Express 5 | Web framework |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | Real-time WebSocket communication |
| Clerk Express | Authentication middleware |
| Stream Node SDK | Video/chat token generation |
| Groq SDK | AI code review |
| Inngest | Background job processing |
| Svix | Webhook verification |

### External APIs

| Service | Purpose |
|---|---|
| Judge0 CE | Sandboxed code execution |
| Groq | AI-powered code analysis |
| Clerk | Authentication and user management |
| Stream | Video calls and chat |

---

## Project Structure

```
Dev-Nexus/
├── Backend/
│   └── src/
│       ├── controllers/        # Route handlers
│       │   ├── aiReviewController.js
│       │   ├── chatController.js
│       │   ├── codeController.js
│       │   ├── focusController.js
│       │   ├── notesController.js
│       │   └── sessionController.js
│       ├── lib/                # Config and utilities
│       │   ├── db.js
│       │   ├── env.js
│       │   └── inngest.js
│       ├── middleware/         # Auth middleware
│       │   └── protectRoute.js
│       ├── models/             # Mongoose schemas
│       │   ├── Note.js
│       │   ├── Session.js
│       │   └── User.js
│       ├── routes/             # Express route definitions
│       │   ├── aiReviewRoute.js
│       │   ├── chatRoutes.js
│       │   ├── codeRoute.js
│       │   ├── notesRoute.js
│       │   ├── sessionRoute.js
│       │   └── webhookRoute.js
│       ├── socket/             # Socket.io event handlers
│       │   └── socketHandler.js
│       └── server.js           # App entry point
├── Frontend/
│   └── src/
│       ├── api/                # API client functions
│       ├── assets/             # Static assets
│       ├── components/         # React components
│       │   ├── ActiveSessions.jsx
│       │   ├── CodeEditorPanel.jsx
│       │   ├── CreateSessionModal.jsx
│       │   ├── FocusMode.jsx
│       │   ├── HostControlPanel.jsx
│       │   ├── Navbar.jsx
│       │   ├── NotesPanel.jsx
│       │   ├── OutputPanel.jsx
│       │   ├── ProblemDescription.jsx
│       │   ├── RecentSessions.jsx
│       │   ├── StatsCards.jsx
│       │   ├── VideoCallUI.jsx
│       │   └── WelcomeSection.jsx
│       ├── data/               # Problem definitions
│       │   └── problems.js
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities
│       ├── pages/              # Page components
│       │   ├── DashboardPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── ProblemPage.jsx
│       │   ├── ProblemsPage.jsx
│       │   └── SessionPage.jsx
│       ├── App.jsx             # Root component with routing
│       └── main.jsx            # App entry point
└── README.md
```

---

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- API keys for: **Clerk**, **Stream**, **Groq**

---

## Environment Variables

Create a `.env` file in the `Backend/` directory with the following variables:

```env
PORT=3000
DB_URL=your_mongodb_connection_string
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stream
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Groq (AI Code Review)
GROQ_API_KEY=your_groq_api_key

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

The Frontend requires the Clerk publishable key to be set as a Vite environment variable (check `Frontend/.env` or the Clerk React setup in `main.jsx`).

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dipanjan-halder-champahati/Dev-Nexus.git
cd Dev-Nexus
```

### 2. Set up the Backend

```bash
cd Backend
npm install
```

Create the `.env` file as described above, then start the development server:

```bash
npm run dev
```

The backend runs on `http://localhost:3000` by default.

### 3. Set up the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhooks` | Clerk webhook handler (user sync) |
| GET/POST | `/api/sessions` | Session CRUD and management |
| POST | `/api/run-code` | Execute code via Judge0 |
| POST | `/api/ai-review` | AI-powered code review |
| GET/POST | `/api/notes` | Per-session notes |
| GET/POST | `/api/chat` | Stream chat token and setup |
| GET | `/api/sync-users` | Manual Clerk-to-MongoDB user sync |
| GET | `/health` | Health check |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## License

This project is licensed under the ISC License.
