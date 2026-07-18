We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. Scope is capture-only: a user scans a QR code, identifies themselves, fills a 2-step form (details then YES/NO checklists), and we save it to the DB. No notifications, dashboards, or escalation — those are out of scope. Keep the UI compact and content-dense with minimal wasted space. Build exactly what each phase asks and stop at its acceptance check.

---

PHASE 0 TASK:

Scaffold

Create the project skeleton for the EHS Reporting Portal.

Layout:
```
ehs-portal/
  backend/    (Spring Boot, Maven, Java 21)
  frontend/   (Vite + React + TypeScript)
  README.md
```
Backend: Spring Boot 3.3+, dependencies web, data-jpa, validation, flyway-core, flyway-mysql, mysql-connector-j, and org.apache.commons:commons-text (for fuzzy matching later). Package `com.company.ehs`. Application on port 8080, context path `/`. Configure `application.yml` to connect to MySQL 8, reading connection details from env vars with localhost defaults:
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/ehs?useSSL=false&serverTimezone=UTC}
    username: ${DB_USER:ehs}
    password: ${DB_PASS:ehs}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.dialect: org.hibernate.dialect.MySQLDialect
  flyway:
    enabled: true
```
Assume a MySQL 8 server is already running and a database `ehs` exists (with a user that can access it). Do NOT add Docker or docker-compose.
Frontend: Vite React-TS template. Configure a dev proxy so `/api` calls forward to `http://localhost:8080`.
README: prerequisites (Java 21, Maven, Node, a running MySQL 8 with an `ehs` schema), how to set the DB env vars, run backend (`mvn spring-boot:run`), run frontend (`npm run dev`).

Acceptance: with MySQL reachable, `mvn -q -DskipTests package` builds and the app boots and connects to the DB; `npm install && npm run dev` serves the Vite default page.
