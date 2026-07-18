We are building an EHS Reporting Portal. Stack: Java 21 + Spring Boot 3, Spring Data JPA, MySQL 8, Flyway, Maven for the backend; React 18 + Vite + TypeScript for the frontend. Scope is capture-only: a user scans a QR code, identifies themselves, fills a 2-step form (details then YES/NO checklists), and we save it to the DB. No notifications, dashboards, or escalation — those are out of scope. Keep the UI compact and content-dense with minimal wasted space. Build exactly what each phase asks and stop at its acceptance check.

---

PHASE 1 TASK:

Database & entities

Add the data layer. Target MySQL 8.

Flyway migration `V1__init.sql` (MySQL syntax, InnoDB, utf8mb4):
- Table `report`: id BIGINT AUTO_INCREMENT PRIMARY KEY, employee_id VARCHAR(50) NOT NULL, employee_name VARCHAR(150) NOT NULL, designation VARCHAR(150) NOT NULL, report_type VARCHAR(40), shift CHAR(1), reporter_category VARCHAR(20), severity VARCHAR(10), location VARCHAR(200), event_date DATE, event_time TIME, report_description TEXT, corrective_action TEXT, hod_comments TEXT, reporter_name VARCHAR(150), status VARCHAR(12) NOT NULL DEFAULT 'DRAFT', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP.
- Index on `employee_id`.
- Table `checklist_item`: id BIGINT AUTO_INCREMENT PRIMARY KEY, report_id BIGINT NOT NULL, section VARCHAR(30) NOT NULL, item_code VARCHAR(20) NOT NULL, item_label VARCHAR(255) NOT NULL, answer VARCHAR(3), CONSTRAINT fk_checklist_report FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE, UNIQUE KEY uq_report_item (report_id, item_code).
- Both tables `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`.

JPA: entities `Report` and `ChecklistItem` with the correct relationship (Report has many ChecklistItem, cascade all, orphanRemoval). Use `GenerationType.IDENTITY` for the ids (MySQL AUTO_INCREMENT). Enums `ReportType`, `ReporterCategory`, `Severity`, `ReportStatus`, `ChecklistSection` stored as STRING. Repositories `ReportRepository`, `ChecklistItemRepository`.
In `ReportRepository` add the exact-key draft lookup (no fuzzy logic in SQL — MySQL has no similarity function):
```java
Optional<Report> findFirstByEmployeeIdAndStatusOrderByUpdatedAtDesc(String employeeId, ReportStatus status);
```
Fuzzy name/designation comparison will be done in the service layer in Phase 2 using apache-commons-text.

Acceptance: app boots, Flyway applies V1 against MySQL, both tables exist with the FK and unique constraint.
