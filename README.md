# 🎓 Student Management System

A full-stack, enterprise-grade Student Management System built with **React 19**, **Node.js + Express**, **PostgreSQL**, and **Firebase Storage**, designed with a warm **Claymorphism** design system.

---

## ✨ Features

- **📋 Student Directory & Profiles**:
  - Live search by student name, email, or admission number.
  - Multi-criteria filtering by academic course and year level.
  - Server-side pagination with URL query synchronization.
  - Detailed student profile view with formatted contact details, academic info, and metadata.
- **➕ Student Enrollment & Updates**:
  - Add and update student records with field-level validations.
  - Drag-and-drop portrait photo uploads directly to Firebase Cloud Storage.
  - Auto-generated institutional admission numbers (`ADM{YYYY}{SEQ}`).
- **☑️ Multi-Select Bulk Actions**:
  - Select individual students or "Select All" on the active page.
  - Perform bulk deletions with confirmation dialogs, removing database records and corresponding Firebase Storage assets.
- **📊 Analytics Dashboard**:
  - KPI summary metrics for total enrollments, active courses, and audit logs.
  - Proportional course enrollment distribution chart with animated progress bars.
  - Academic year cohort distribution breakdown.
  - Live activity audit log feed tracking student additions, updates, deletions, and bulk operations.
  - Dynamic zero-dummy-data empty states.
- **🍞 Claymorphic Toast Notifications**:
  - Global reactive toast notifications with dual outset lighting shadows, rounded borders, and custom animations.
- **📥 CSV Export Utility**:
  - One-click export of student directory records to a downloadable `.csv` file.

---

## 🏗️ Architecture & Tech Stack

- **Frontend (`/client`)**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, React Router v7.
- **Backend (`/server`)**: Node.js, Express.js (ES Modules), Multer, PostgreSQL Client (`pg`), Firebase Admin SDK.
- **Database**: PostgreSQL (relational constraints, indices, auto-updating triggers, and audit logging).
- **Photo Storage**: Firebase Cloud Storage (secure binary asset uploads with public/signed URLs).

---

## 📁 Monorepo Folder Structure

```text
student-management-system/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── api/                # Type-safe API client functions
│   │   ├── components/         # Reusable UI components (Avatar, FormField, ConfirmDialog, etc.)
│   │   ├── context/            # React Contexts (ToastContext)
│   │   ├── pages/              # Route pages (StudentListPage, FormPage, DetailPage, AnalyticsPage)
│   │   ├── types/              # TypeScript interfaces & types
│   │   ├── App.tsx             # Main routing & application layout
│   │   ├── main.tsx            # React DOM mounting entry point
│   │   └── index.css           # Claymorphic design system tokens & utilities
│   ├── index.html              # HTML template
│   ├── package.json            # Client dependencies and scripts
│   ├── tsconfig.json           # Client TypeScript configuration
│   └── vite.config.ts          # Vite build & proxy configuration
├── server/                     # Backend Express.js application
│   ├── config/
│   │   ├── db.js               # PostgreSQL connection pool configuration
│   │   └── firebase.js         # Firebase Admin SDK & Cloud Storage bucket
│   ├── middleware/
│   │   ├── upload.js           # Multer file upload & validation middleware
│   │   └── validateStudent.js  # Field validation middleware
│   ├── migrations/
│   │   ├── 001_create_students_table.sql # PostgreSQL DDL migration
│   │   ├── 002_add_activity_logs.sql    # Audit logs migration
│   │   ├── migrate.js          # Migration execution runner
│   │   └── schema.sql          # Complete baseline schema documentation
│   ├── routes/
│   │   ├── students.routes.js  # Student CRUD & bulk delete endpoints
│   │   ├── analytics.routes.js # Analytics aggregation endpoints
│   │   └── activity.routes.js  # Activity logs endpoint
│   ├── utils/
│   │   └── logger.js           # Activity log helper
│   ├── app.js                  # Express app initialization & error handling
│   ├── server.js               # Server entry point & HTTP listener
│   └── package.json            # Server dependencies and scripts
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules (protects credentials & build output)
├── package.json                # Root workspace configuration & scripts
└── README.md                   # Project documentation
```

---

## 🗄️ Database Schema

### `students` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique immutable identifier |
| `admission_number` | `VARCHAR(30)` | `UNIQUE, NOT NULL` | Structured student ID (`ADM{YEAR}{SEQ}`) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full student name |
| `course` | `VARCHAR(100)` | `NOT NULL` | Enrolled academic program |
| `year` | `SMALLINT` | `NOT NULL, CHECK (year BETWEEN 1 AND 8)` | Academic year level |
| `date_of_birth` | `DATE` | `NOT NULL` | Student birth date |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL, CHECK (format)` | Primary email address |
| `mobile_number` | `VARCHAR(20)` | `NOT NULL, CHECK (format)` | Formatted phone number |
| `gender` | `VARCHAR(20)` | `NOT NULL` | Gender classification |
| `address` | `TEXT` | `NULLABLE` | Residential / mailing address |
| `photo_url` | `TEXT` | `NULLABLE` | Firebase Storage download URL |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Auto-updated modification timestamp |

### `activity_logs` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique log identifier |
| `action_type` | `VARCHAR(50)` | `NOT NULL` | Action tag (`CREATE_STUDENT`, `UPDATE_STUDENT`, `DELETE_STUDENT`, `BULK_DELETE_STUDENTS`) |
| `description` | `TEXT` | `NOT NULL` | Human-readable log description |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Event timestamp (indexed DESC) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **PostgreSQL**: Local instance or cloud database (e.g., Supabase / Neon / AWS RDS)
- **Firebase Project**: Optional, for photo storage credentials

### 2. Installation
Clone the repository and install all dependencies:
```bash
# Clone the repository
git clone https://github.com/your-username/student-management-system.git
cd student-management-system

# Install all monorepo dependencies (client + server + root)
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in your database URL and Firebase credentials in `.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
```

### 4. Run Migrations
Run the migration script to provision the tables, triggers, and indices:
```bash
npm run migrate
```

### 5. Start Development Server
Run both the backend Express API and the frontend React Vite client with a single concurrent command:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Health Diagnostic**: `http://localhost:3000/api/health`

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both server and client concurrently in development mode |
| `npm run dev:server` | Runs Express backend only with nodemon |
| `npm run dev:client` | Runs Vite React frontend only |
| `npm run migrate` | Executes PostgreSQL DDL migrations in sequence |
| `npm run build` | Builds the client production bundle |
| `npm run start` | Starts the production Express server |

---

## 🔒 Security & Git Safety

- `.env` and all credential keys are strictly excluded via `.gitignore`.
- SQL queries use parameterized placeholders (`$1`, `$2`) to prevent SQL injection.
- Strict MIME type and 5MB payload size validation on photo uploads.
- PostgreSQL connections over SSL with `rejectUnauthorized: false` for Supabase compatibility.
