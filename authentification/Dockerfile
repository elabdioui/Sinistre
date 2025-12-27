# Dockerfile pour Service Authentification
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
COPY --from=builder /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8099

# Variables d'environnement
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://eureka-server:8761/eureka/"
ENV SPRING_DATASOURCE_URL="jdbc:postgresql://postgres-auth:5432/service_authentification"
ENV SPRING_DATASOURCE_USERNAME="postgres"
ENV SPRING_DATASOURCE_PASSWORD="postgres"

# Lancer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]