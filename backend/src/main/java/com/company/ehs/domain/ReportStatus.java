package com.company.ehs.domain;

/**
 * Lifecycle status of a report. Stored as STRING in {@code report.status}
 * (VARCHAR(12)); the column defaults to {@code DRAFT}.
 */
public enum ReportStatus {
    DRAFT,
    SUBMITTED
}
