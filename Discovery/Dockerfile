# Dockerfile pour Eureka Server
FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier les fichiers Maven
COPY pom.xml .
COPY src ./src

# Build l'application
RUN mvn clean package -DskipTests

# Stage de production
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR depuis le builder
COPY target/*.jar app.jar

# Exposer le port
EXPOSE 8761

# Variables d'environnement
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Lancer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]