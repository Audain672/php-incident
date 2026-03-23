FROM php:8.2-fpm-alpine

# Extensions nécessaires
RUN apk add --no-cache \
    libpng-dev libjpeg-turbo-dev libwebp-dev \
    libzip-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install \
        pdo_mysql gd zip mbstring bcmath opcache

# Extension Redis
RUN apk add --no-cache autoconf g++ make \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf g++ make

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize

# Permissions storage
RUN mkdir -p storage/uploads/incidents storage/logs \
    && chown -R www-data:www-data storage \
    && chmod -R 775 storage
