FROM php:8.4.19-apache

WORKDIR /var/www/html

RUN a2enmod rewrite

RUN a2enmod actions

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip zip \
    && rm -rf /var/lib/apt/lists/*

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php -r "if (hash_file('sha384', 'composer-setup.php') === 'c8b085408188070d5f52bcfe4ecfbee5f727afa458b2573b8eaaf77b3419b0bf2768dc67c86944da1544f06fa544fd47') { echo 'Installer verified'.PHP_EOL; } else { echo 'Installer corrupt'.PHP_EOL; unlink('composer-setup.php'); exit(1); }" \
    && php composer-setup.php \
    && php -r "unlink('composer-setup.php');" \
    && mv composer.phar /usr/local/bin/composer

COPY ./Negocio/composer.json ./composer.json

RUN composer install --no-interaction --prefer-dist --no-progress

COPY ./Negocio/public ./public
COPY ./Negocio/src ./src
COPY ./Negocio/.env .

RUN composer dump-autoload --optimize

RUN sed -i 's/DocumentRoot.*$/DocumentRoot \/var\/www\/html\/public/' /etc/apache2/sites-available/000-default.conf