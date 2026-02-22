# Anvys Hub 

A full-stack business management system that combines POS, inventory tracking, and HR tools into one platform. It helps small to mid-sized businesses manage sales, monitor stock levels in real time, and handle employee records without switching between multiple systems.

---

## Key Features

### Point of Sale (POS)
- Fast and responsive checkout interface designed for high-volume transactions.
- Real-time product image integration and dynamic cart management.
- Seamless staff context integration.

### Inventory Management
- Comprehensive stock tracking and robust movement logs.
- Dynamic staff inventory filters based on assigned locations.
- Categorized product tables and automated stock auditing tools.

### Human Resources & Employee Management
- **Attendance Tracking**: Secure PIN-based attendance with real-time clock-in/out validations.
- **Automated Payroll**: Draft, pending, and finalized payroll generation. 
- **Payslip Generation**: Dynamic PDF exports utilizing `jspdf` and `html2canvas`.
- **Roster & Scheduling**: Advanced shift scheduling via interactive calendar interfaces powered by FullCalendar.

### Reporting & Analytics
- Detailed analytics and data grids for payroll summaries, inventory movements, and staff attendance.

---

## Tech Stack & Architecture

Anvys Hub is built on a modern, robust tech stack prioritizing performance, security, and developer experience.

### Backend
- **Framework:** [Laravel 12.0](https://laravel.com/) (PHP 8.2+)
- **Database:** MySQL 
- **Architecture:** Monolith backend paired with Inertia.js for seamless single-page application (SPA) delivery without the complexity of a separate API layer.

### Frontend
- **Core:** [React 19](https://react.dev/) integrated via [Inertia.js v2.0](https://inertiajs.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) bundled with Vite
- **Key Libraries:** 
  - `lucide-react` for iconography
  - `date-fns` for robust date/time manipulation
  - `@fullcalendar/react` for event and roster management
  - `motion` for fluid micro-interactions and animations

---

## Getting Started

Follow these instructions to set up the project on your local machine for development and testing.

### Prerequisites
- **PHP** >= 8.2
- **Composer** (Dependency Manager for PHP)
- **Node.js** (v18+) & **npm**
- **MySQL** (or equivalent relational database)

### Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd anvys-hub
   ```

2. **Install Backend Dependencies:**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

4. **Environment Configuration:**
   Copy the example environment file and generate an application key.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Note: Ensure you update the `.env` file with your local database credentials (e.g., `DB_DATABASE=anvys_hub`).*

5. **Run Migrations & Seeders:**
   Set up your database tables and seed initial foundational data (e.g., Roles, POS seeders).
   ```bash
   php artisan migrate --seed
   ```

6. **Start the Development Environment:**
   Anvys Hub requires both the backend framework and the frontend Vite bundler to be running simultaneously.

   **Option A: Concurrently (Recommended)**
   ```bash
   composer run dev
   ```

   **Option B: Separate Terminals**
   ```bash
   php artisan serve
   ```
   ```bash
   npm run dev
   ```

7. **Access the Application:**
   Open your browser and navigate to `http://localhost:8000`.

---

## 📂 Project Structure Overview

Understanding the core directory structure is crucial for seamless navigation and contribution.

```text
anvys-hub/
├── app/
│   ├── Http/Controllers/    # Backend business logic controllers 
│   └── Models/              # Eloquent Object-Relational Mapping (ORM) models.
├── database/
│   ├── migrations/          # Version-controlled database schema changes.
│   └── seeders/             # Initial database population scripts.
├── resources/
│   ├── css/                 # Global styles and Tailwind configuration
│   └── js/
│       ├── Components/      # Reusable React UI components.
│       └── Pages/           # Top-level Inertia.js React views routed directly from Laravel.
├── routes/
│   └── web.php              # Application web route definitions.
└── tests/                   # Automated application tests 
```

---
