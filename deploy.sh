#!/bin/bash

# Build the project
npm run build

# Remove old deployment
rm -rf /var/www/html/ens4912/*

# Copy new build
cp -r build/* /var/www/html/ens4912/

# Set permissions
chown -R www-data:www-data /var/www/html/ens4912
chmod -R 755 /var/www/html/ens4912

echo "Deployment completed successfully!" 