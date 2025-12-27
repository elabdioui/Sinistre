FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8091
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE="http://discovery:8761/eureka/"
ENV SPRING_DATASOURCE_URL="jdbc:postgresql://postgres:5432/authentification"
ENV SPRING_DATASOURCE_USERNAME="postgres"
ENV SPRING_DATASOURCE_PASSWORD="0000"
ENTRYPOINT ["java", "-jar", "app.jar"]