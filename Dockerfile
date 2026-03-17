# syntax=docker/dockerfile:1
#
# Batteries-included Dockerfile for Laravel 12 + Vite (React/Inertia) on Render.
# - Installs common Laravel PHP extensions
# - Installs PHP deps via Composer (prod only)
# - Builds frontend assets via Vite
# - Runs the app on $PORT (Render sets this env var)
#
# This image uses PHP's built-in server for simplicity. For higher traffic,
# swap runtime to nginx + php-fpm (more moving parts, but better performance).

FROM php:8.4-cli AS php_base

WORKDIR /var/www/html

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

# System packages + common PHP extensions.
# Covers typical Laravel needs: mysql, mbstring, zip, gd, intl, bcmath, exif, opcache, pcntl.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libicu-dev \
        libonig-dev \
        libpq-dev \
    ; \
    docker-php-ext-configure gd --with-freetype --with-jpeg; \
    docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        pdo_pgsql \
        zip \
    ; \
    rm -rf /var/lib/apt/lists/*

# Basic opcache config (safe defaults for many apps).
RUN set -eux; \
    { \
      echo "opcache.enable=1"; \
      echo "opcache.enable_cli=1"; \
      echo "opcache.memory_consumption=128"; \
      echo "opcache.interned_strings_buffer=16"; \
      echo "opcache.max_accelerated_files=20000"; \
      echo "opcache.validate_timestamps=1"; \
      echo "opcache.revalidate_freq=2"; \
      echo "opcache.jit=0"; \
    } > /usr/local/etc/php/conf.d/zz-opcache.ini

# Composer (copied from the official composer image).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

FROM php_base AS vendor

# Copy application sources (excluding vendor/node_modules via .dockerignore).
COPY . .

# Install production PHP dependencies.
RUN set -eux; \
    composer install \
      --no-dev \
      --prefer-dist \
      --no-progress \
      --optimize-autoloader \
      --classmap-authoritative

FROM node:20-alpine AS assets

WORKDIR /var/www/html

# Install JS deps.
COPY package.json package-lock.json ./
RUN npm ci

# Copy only what Vite needs to build.
COPY vite.config.js ./
COPY resources ./resources
COPY public ./public

# Vite alias points at Ziggy inside vendor/; copy just the needed ESM entry.
COPY --from=vendor /var/www/html/vendor/tightenco/ziggy/dist/index.esm.js ./vendor/tightenco/ziggy/dist/index.esm.js

RUN npm run build

FROM php_base AS runtime

WORKDIR /var/www/html

ENV APP_ENV=production \
    APP_DEBUG=false

# Copy the app (including vendor) and built frontend assets.
COPY --from=vendor /var/www/html /var/www/html
COPY --from=assets /var/www/html/public/build /var/www/html/public/build

# Entry point script is created inside the image so the Dockerfile is self-contained.
RUN cat > /entrypoint.sh <<'EOF'
#!/usr/bin/env sh
set -e

cd /var/www/html

# Render provides $PORT. Default helps local docker runs.
PORT="${PORT:-10000}"

# Ensure writable Laravel directories exist.
mkdir -p \
  storage/app/public \
  storage/app/private \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

# Best-effort permissions (some environments may ignore chown).
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Ensure the public storage symlink exists for uploaded/public files.
if [ ! -e public/storage ]; then
  php artisan storage:link 2>/dev/null || true
fi

# Optional: run migrations/seed automatically on boot.
# Recommended:
# - First deploy only: RUN_MIGRATIONS=true and RUN_SEED=true
# - Then remove RUN_SEED (and usually RUN_MIGRATIONS) after DB is initialized
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --force

  if [ "${RUN_SEED:-false}" = "true" ]; then
    php artisan db:seed --force
  fi
fi

exec php -S 0.0.0.0:"$PORT" -t public public/index.php
EOF

RUN chmod +x /entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["/entrypoint.sh"]
