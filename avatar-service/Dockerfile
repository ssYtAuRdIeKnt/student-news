# ---- Stage 1: build the JAR (JDK + Maven) -----------------------------------
# Same Java major version as java.version in pom.xml and the CI test job: 27.
FROM maven:3.10-eclipse-temurin-27 AS build
WORKDIR /app
# Dependencies first, in their own layer: it is only rebuilt when pom.xml
# changes, so editing Java code does not download everything again.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
# Source code last, because it changes most often.
COPY src ./src
# Tests run in CI ("Avatar service · tests"); here we only package the JAR.
RUN mvn -B -q clean package -DskipTests

# ---- Stage 2: run it (JRE only, Alpine) --------------------------------------
# No JDK, no Maven, no source code: a small image with less to attack.
FROM eclipse-temurin:27-jre-alpine
WORKDIR /app
# An unprivileged user with a fixed numeric id (Kubernetes runAsNonRoot can
# check a number, not a name).
RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app
# The upload directory must exist and belong to that user: a non-root process
# cannot create /data itself, because / is owned by root. A new named volume
# mounted here copies this ownership.
RUN mkdir -p /data/avatars && chown app:app /data/avatars
# Only the finished JAR comes from the build stage. It stays owned by root, so
# the app can read it but cannot change it.
COPY --from=build /app/target/avatar-service.jar app.jar
USER 10001:10001
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
