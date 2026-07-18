package com.company.ehs.domain;

/**
 * Severity of the reported event. Stored as STRING in {@code report.severity}
 * (VARCHAR(10)).
 */
public enum Severity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}
