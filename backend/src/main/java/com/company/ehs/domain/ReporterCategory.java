package com.company.ehs.domain;

/**
 * Category of the person filing the report. Stored as STRING in
 * {@code report.reporter_category} (VARCHAR(20)).
 */
public enum ReporterCategory {
    STAFF,
    CONTRACTOR,
    OTHER,
    VISITOR
}
