-- Phase 6 schema changes. Applied on top of the live V1 schema (V1 already ran
-- on the deployed DB and MUST NOT be edited). All statements here are additive
-- or altering and safe against existing rows.

-- CHANGE 2: report type becomes multi-valued (up to 3 per report).
CREATE TABLE report_type (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT      NOT NULL,
    type      VARCHAR(40) NOT NULL,
    CONSTRAINT fk_reporttype_report FOREIGN KEY (report_id) REFERENCES report(id) ON DELETE CASCADE,
    UNIQUE KEY uq_report_type (report_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carry each existing single report_type value into the new table before dropping it.
INSERT INTO report_type (report_id, type)
    SELECT id, report_type FROM report WHERE report_type IS NOT NULL;

ALTER TABLE report DROP COLUMN report_type;

-- CHANGE 3: remove HOD comments and reporter name entirely.
ALTER TABLE report DROP COLUMN hod_comments;
ALTER TABLE report DROP COLUMN reporter_name;

-- CHANGE 5: employee vs non-employee identity.
ALTER TABLE report ADD COLUMN person_kind             VARCHAR(20)  NOT NULL DEFAULT 'EMPLOYEE';
ALTER TABLE report ADD COLUMN non_employee_type       VARCHAR(20)  NULL;
ALTER TABLE report ADD COLUMN non_employee_other_desc VARCHAR(255) NULL;

-- Non-employees have no employee id and no designation, so both become optional.
-- (Existing rows keep their values and default to person_kind='EMPLOYEE'.)
ALTER TABLE report MODIFY COLUMN employee_id VARCHAR(50)  NULL;
ALTER TABLE report MODIFY COLUMN designation VARCHAR(150) NULL;
