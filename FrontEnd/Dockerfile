# Dockerfile pour Angular Frontend
# Stage 1: Build l'application Angular
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build l'application en mode production
RUN npm run build -- --configuration production

# Stage 2: Servir avec Nginx
FROM nginx:1.25-alpine

# Supprimer la configuration par défaut de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist/insurance-frontend/browser /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
