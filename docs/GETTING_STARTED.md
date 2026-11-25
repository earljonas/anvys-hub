# Getting started

[Back to the README](../README.md) · [Architecture](ARCHITECTURE.md)

## Prerequisites

- PHP 8.4 with the Laravel extensions and the `pdo_mysql` driver.
- Composer 2.
- Node.js matching the [locked Vite toolchain](../package-lock.json), `^20.19.0 || >=22.12.0`, and npm.
- A running MySQL server and an empty database for local development.

The [Composer manifest](../composer.json) declares PHP 8.2, while several [locked production packages](../composer.lock) require PHP 8.4. Use PHP 8.4 for the commands below.

## Install and configure

Clone the repository, or open the root of an existing checkout.

```sh
git clone https://github.com/earljonas/anvys-hub.git
cd anvys-hub
```

The Composer manifest sets a machine-specific certificate path. Override it for your shell using the CA bundle checked into the repository.

- PowerShell uses `$env:COMPOSER_CAFILE = (Resolve-Path .\cacert.pem).Path`.
- A Unix shell uses `export COMPOSER_CAFILE="$PWD/cacert.pem"`.

```sh
composer install
npm ci
```

Composer may report that the lockfile is out of sync with the manifest. The required packages are still listed in the committed lockfile, which `composer install` uses for dependency versions.

Copy [`.env.example`](../.env.example) to `.env` on a fresh checkout. In PowerShell, use `Copy-Item .env.example .env`. In a Unix shell, use `cp .env.example .env`.

Set `DB_CONNECTION=mysql`, then set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` for the local database. You can also set `APP_TIMEZONE`, which defaults to UTC. The example uses database-backed sessions, cache, and queues. Their tables are included in the [migrations](../database/migrations).

```sh
php artisan key:generate
php artisan migrate --seed
```

The [database seeder](../database/seeders/DatabaseSeeder.php) creates local administrator and staff accounts, locations, and employee records. It also loads the sample [POS catalog](../database/seeders/POSSeeder.php) and [event packages](../database/seeders/EventPackageSeeder.php). Seed a disposable demo database. For schema updates on a database you intend to keep, use `php artisan migrate`.

## Start the application

```sh
composer run dev
```

This starts Laravel, the queue listener, and Vite. Open [localhost:8000](http://localhost:8000) and use the local demo accounts defined in the [database seeder](../database/seeders/DatabaseSeeder.php). Administrators set up an authenticator app on first sign-in and enter a one-time code before reaching the dashboard. Staff sign-in opens attendance, with links to the schedule, POS, and inventory.

To try the seeded workflow, sign in as staff, open POS, add a catalog item, and record a sample cash checkout. The completed order opens a receipt that you can download. Sign in as an administrator to see the recorded sale in the sales report for the current month.

You can also run the dev processes in separate terminals.

| Command | Purpose |
| --- | --- |
| `php artisan serve` | Serve Laravel and the Inertia entry page. |
| `npm run dev` | Serve frontend assets with Vite and reload during development. |
| `php artisan queue:listen --tries=1` | Run the queue listener included in the Composer dev script. |
| `npm run build` | Build assets and the Vite manifest under `public/build/`. Run this after installing Composer dependencies because the Vite config imports Ziggy from `vendor/`. |

## Run the existing tests

`composer test` clears Laravel's configuration cache and runs the default Pest suite. [`phpunit.xml`](../phpunit.xml) selects an in-memory SQLite database by default, which requires `pdo_sqlite`. The two database-backed feature tests use transactions and fail on a fresh run because the in-memory schema is empty. The guest smoke test expects HTTP 200 from `/`, while the route currently redirects guests to the login page with HTTP 302.

For the [MySQL feature configuration](../phpunit.mysql.xml), copy `.env.example` to `.env.testing` and configure a dedicated empty test database. Keep `.env.testing` out of commits, since Git does not ignore it by default. Check for process-level database variables before running the suite, since they can override the test file.

```sh
php artisan key:generate --env=testing
php artisan migrate --env=testing
php vendor/bin/pest --configuration=phpunit.mysql.xml
```

The repository has no tracked CI workflow. Review test output directly when verifying changes.

## Container configuration

The [Dockerfile](../Dockerfile) uses PHP 8.4 for production Composer dependencies, builds Vite assets in a Node stage, and serves Laravel from `public/` using PHP's built-in server. The runtime runs as `www-data` and expects an application key and a reachable database. The default container port is `10000`, overridable with `PORT`. Laravel exposes `/up` as a health endpoint.

The container's Composer install also needs a CA bundle path that resolves inside the build environment. The committed Dockerfile currently supplies no override for the manifest's machine-specific path. Use the platform's environment configuration for the runtime app key, application URL, and database settings. The entrypoint supports `RUN_MIGRATIONS=true` and runs the demo seeder only when `RUN_SEED=true` is also set. Reserve demo seeding for a disposable environment. Review the migrations before applying them to existing data, especially the migrations that drop and recreate attendance and payroll tables when applied.
