# 🎓 Student Management System

A full-scale, enterprise-grade Student Management System built with **React 19**, **Node.js + Express**, **PostgreSQL**, and **Firebase Storage**, styled with a warm, custom **Claymorphism** design system.

---

## ✨ Features

- **📋 Student Directory & Profiles**:
  - Live search by student name, email, or admission number.
  - Multi-criteria filtering by academic course and year level.
  - Server-side pagination with URL query synchronization.
  - Detailed student profile views with formatted contact records, academic metrics, and photo avatars.
- **➕ Student Enrollment & Updates**:
  - Comprehensive form validation for all 8 core student fields.
  - Drag-and-drop portrait photo uploads directly to Firebase Cloud Storage.
  - Auto-generated institutional admission numbers (`ADM{YYYY}{SEQ}`) driven by database sequences.
- **☑️ Multi-Select Bulk Actions**:
  - Select individual rows or use "Select All" across the active view.
  - Perform bulk deletions with confirmation safeguards, simultaneously cleaning up database rows and orphaned Firebase Storage files.
- **📊 Analytics Dashboard**:
  - KPI metric summaries for total enrollments, active programs, and audit logs.
  - Dynamic course enrollment distribution breakdown.
  - Academic year cohort tracking.
  - Live activity audit log feed tracking system events (`CREATE`, `UPDATE`, `DELETE`, `BULK_DELETE`).
  - Strict zero-dummy-data architecture—renders empty states dynamically when tables are clear.
- **🍞 Claymorphic Toast Notifications**:
  - Global reactive toast alerts featuring dual outset lighting shadows, custom border radiuses, and smooth entry animations.
- **📥 CSV Export Utility**:
  - One-click export capability that converts the active student dataset into a neatly formatted downloadable `.csv` file.

---

## 🏗️ Architecture & Tech Stack

- **Frontend (`/client`)**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, React Router v7.
- **Backend (`/server`)**: Node.js, Express.js (ES Modules), Multer, PostgreSQL Client (`pg`), Firebase Admin SDK.
- **Database**: PostgreSQL hosted on Supabase (relational constraints, custom functions, triggers, and indices).
- **Photo Storage**: Firebase Cloud Storage (secure binary handling with remote signed URLs).

---

## 📁 Monorepo Folder Structure

```text
student-management-system/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── api/                # Type-safe API client wrappers
│   │   ├── components/         # Reusable UI elements (Avatar, FormField, ConfirmDialog)
│   │   ├── context/            # React Contexts (ToastContext)
│   │   ├── pages/              # Views (StudentListPage, StudentFormPage, DetailPage, AnalyticsPage)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Root routing layout
│   │   ├── main.tsx            # DOM entry point
│   │   └── index.css           # Claymorphic design tokens & utility classes
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                     # Backend Express.js application
│   ├── config/
│   │   ├── db.js               # PostgreSQL connection pool configuration
│   │   └── firebase.js         # Firebase Admin SDK & Bucket setup
│   ├── middleware/
│   │   ├── upload.js           # Multer file parsing & type validation
│   │   └── validateStudent.js  # Field validation middleware
│   ├── migrations/
│   │   ├── 001_create_students_table.sql # Core table schema migration
│   │   ├── 002_add_activity_logs.sql    # Audit trail table migration
│   │   └── migrate.js          # Migration runner script
│   ├── routes/
│   │   ├── students.routes.js  # Student CRUD & bulk action endpoints
│   │   ├── analytics.routes.js # Enrollment aggregation routes
│   │   └── activity.routes.js  # Activity logs endpoint
│   ├── app.js                  # Express middleware setup
│   ├── server.js               # HTTP server listener
│   └── package.json
├── vercel.json                 # Vercel monorepo deployment bridge
├── .env.example                # Environment configuration template
├── .gitignore                  # Git exclusion rules
├── package.json                # Root workspace orchestration
└── README.md
```

---

## 🗄️ Database Schema Summary

* **`students`**: Stores complete biographical, academic, and metadata records for each student, including a unique `admission_number` and remote `photo_url` reference. Protected by strict field-level check constraints (email format, phone validation, year ranges 1–8).
* **`activity_logs`**: Operates as a persistent audit trail capturing system events with descriptive text and timestamps indexed for high-performance querying.

---

## 🚀 Getting Started

### 1. Prerequisites

* **Node.js**: v18+ (v20+ recommended)
* **PostgreSQL**: v15+ (configured via Supabase or local instance)
* **Firebase Project**: Optional, required for cloud photo asset storage

### 2. Installation

Clone the repository and install all monorepo dependencies:

```bash
git clone https://github.com/Rohit-ux-stack/student-management-system.git
cd student-management-system
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` in the root workspace directory and populate your remote credentials:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres
FIREBASE_PROJECT_ID=student-management-system-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@student-management-system-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=student-management-system-id.appspot.com
```

### 4. Run Database Migrations

Provision the schema tables, triggers, and sequences inside your PostgreSQL instance:

```bash
npm run migrate
```

### 5. Start Development Environment

Boot up the concurrent development servers:

```bash
npm run dev
```

* **Frontend Client**: `http://localhost:5174` (or `5173`)
* **Backend API**: `http://localhost:3000`

---

## 📜 Available Root Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Runs both backend and frontend concurrently |
| `npm run migrate` | Executes sequential PostgreSQL database migrations |
| `npm run build` | Compiles the client production distribution bundle |
| `npm run start` | Boots the production Express server |

---

## 🔒 Security Architecture

* Parameterized SQL queries (`$1`, `$2`) to completely eliminate SQL injection vulnerabilities.
* Strict payload limits and file extension checks enforced on multi-part uploads.
* Credentials and local configuration artifacts (`.env`, `node_modules/`, `dist/`) are strictly untracked via `.gitignore`.
