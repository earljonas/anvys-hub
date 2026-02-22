# Anvys Hub

A business management platform built for small to mid-sized operations that need POS, inventory, and HR tooling without stitching together three separate systems. Everything runs through one interface — sales, stock levels, event management, employee records, payroll, scheduling.

## Features

### Point of Sale (POS)
The checkout interface handles high-volume transactions and integrates directly with product images. It runs with staff context aware of the current logged-in user to attribute sales correctly.

### Inventory Management
Stock tracking includes detailed movement logs, categorization, and auditing tools. We rely on dynamic staff filters tied to assigned locations to ensure employees only interact with inventory they have access to.

### Human Resources and Payroll Management
The HR module handles attendance tracking via PIN numbers with clock-in/out validations. It also automates payroll generation (draft, pending, finalized states) and supports exporting dynamic PDF payslips using `jspdf` and `html2canvas`. We manage staff scheduling with calendar interfaces powered by FullCalendar.

### Reports and Analytics
Aggregates business data across four primary dashboards:
- **Sales**: Tracks monthly/weekly revenue, peak hours, and best-selling products.
- **Inventory**: Monitors low stock alerts, total valuation, and detailed movement logs.
- **Events**: Summarizes upcoming bookings, attendee counts, and monthly event trends.
- **Payroll**: Calculates Year-to-Date (YTD) totals, average net pay, and pending payroll statuses.

### Event Management
Handles customer bookings for private events like birthday parties or corporate functions. User can create and manage events through a calendar interface, with payment tracking built in to monitor deposits and balances per booking.

## Tech Stack
- **Backend**: Laravel 12.0 (PHP 8.2+) / MySQL
- **Frontend**: React 19 / Inertia.js v2.0
- **Styling**: Tailwind CSS v4 via Vite

## Local Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/earljonas/anvys-hub.git
   cd anvys-hub
   composer install
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env`.
   Generate an application key:
   ```bash
   php artisan key:generate
   ```
   Before moving to the next step, you must configure your database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) in your `.env` file. If you run migrations without updating this, you will get connection refused or table not found errors.

3. **Database Setup**
   Run the migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```
   We rely heavily on seeders to set up initial roles and basic configuration. Never skip the `--seed` flag on a fresh install, or the app will break on login due to missing roles.

4. **Running the App**
   Anvys Hub requires both the backend API and frontend Vite server running concurrently. You can either use the composer shortcut:
   ```bash
   composer run dev
   ```
   Or run these in two separate terminals:
   ```bash
   php artisan serve
   ```
   ```bash
   npm run dev
   ```

## Project Structure

A quick map of where things live so you aren't hunting for files:

- `app/Http/Controllers/`: Standard Laravel backend logic. Our business logic tends to live here instead of dedicated service classes.
- `app/Models/`: Eloquent ORM. Pay attention to the relationships defined here before querying.
- `database/seeders/`: Crucial for local development structure. Check `POSSeeder.php` to see how initial data is structured.
- `resources/js/Pages/`: Top-level React views for Inertia.js. Each file generally maps 1:1 with a backend route.
- `resources/js/Components/`: smaller, reusable UI pieces.
- `routes/web.php`: Standard Laravel routing, mostly returning `Inertia::render()`.

## License

MIT License
