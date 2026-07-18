CREATE TABLE report (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id        VARCHAR(50)  NOT NULL,
    employee_name      VARCHAR(150) NOT NULL,
    designation        VARCHAR(150) NOT NULL,
    report_type        VARCHAR(40),
    shift              CHAR(1),
    reporter_category  VARCHAR(20),
    severity           VARCHAR(10),
    location           VARCHAR(200),
    event_date         DATE,
    event_time         TIME,
    report_description TEXT,
    corrective_action  TEXT,
    hod_comments       TEXT,
    reporter_name      VARCHAR(150),
    status             VARCHAR(12)  NOT NULL DEFAULT 'DRAFT',
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE checklist_item (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id  BIGINT       NOT NULL,
    section    VARCHAR(30)  NOT NULL,
    item_code  VARCHAR(20)  NOT NULL,
    item_label VARCHAR(255) NOT NULL,
    answer     VARCHAR(3),
    CONSTRAINT fk_checklist_report FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_item (report_id, item_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
