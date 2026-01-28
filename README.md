# LMS Full Stack Project

A comprehensive Learning Management System (LMS) built with the MERN stack (MongoDB, Express, React, Node.js). This platform serves both students and educators with features for course management, progress tracking, certification, and AI-powered assistance.

## 🚀 Technology Stack

### Frontend (Client)
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: React Context (`AppContext`)
- **Icons**: Lucide React, React Icons
- **Key Libraries**:
    - `jspdf` (Certificate Generation)
    - `@clerk/clerk-react` (Authentication)
    - `axios` (API Requests)
    - `react-hot-toast` (Notifications)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: Clerk / Firebase / JWT
- **AI Integration**: OpenAI / Google Generative AI (Gemini)
- **File Storage**: Cloudinary
- **Payments**: Razorpay / Stripe

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB connection string
- API Keys (Clerk, Cloudinary, AI Providers, Payment Gateways)

### 1. Client Setup
Navigate to the `client` directory and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
```
The application will run at `http://localhost:5173` (by default).

### 2. Server Setup
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Start the backend server:
```bash
# Development mode (with nodemon)
npm run server

# Production mode
npm start
```
The server will run on port `8000` (or as defined in `.env`).

---

## 🌟 Key Features

### 🎓 Student Dashboard
A dedicated space for students to track their learning journey.
- **My Enrollments**: View and access enrolled courses.
- **Player**: Interactive video player for course content.
- **Project Progress**: specialized tracking for project-based learning.
- **Team Collaboration**: View team status and progress.
- **Certificates**:
    - **Dynamic Generation**: Download PDF certificates upon reaching milestones.
    - **Progress Certificate**: Unlocked at 75% progress.
    - **Completion Certificate**: Unlocked at 100% progress.
    - **Integration**: Auto-fills user name with editing capability.
- **Job Application**: Direct link to apply for jobs upon course completion.
- **AI Assistant**: Built-in AI support for queries.

### 👨‍🏫 Admin / Educator Dashboard
Powerful tools for content creators and administrators.
- **Course Management**: Create, update, and delete courses.
- **Student Management**: View enrolled students and their progress.
- **Analytics**: specific insights into course performance (inferred).
- **Assignments**: Manage course assignments and projects.
- **Assessments**: Create and track student assessments.
- **Calendar**: Manage events and schedules.
- **Tickets**: Support ticket system for issue resolution.
- **Notifications**: System-wide notifications for users.
- **To-Do**: Personal task management.

---

## 📜 Commands

### Client
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint for code quality |

### Server
| Command | Description |
| :--- | :--- |
| `npm run server` | Starts the server with Nodemon (auto-restart) |
| `npm start` | Starts the server in production node |

---

## 🔒 Environment Variables
Ensure you have a `.env` file in both `client` and `server` directories with the necessary keys:

**Client .env:**
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL`
- (Other public keys)

**Server .env:**
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `OPENAI_API_KEY` / `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY` / `RAZORPAY_KEY_SECRET`
