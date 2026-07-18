package com.company.ehs.domain;

/**
 * Kind of EHS report being filed. Stored as STRING in {@code report.report_type}
 * (VARCHAR(40)); keep constant names within that width.
 */
public enum ReportType {
    NEAR_MISS,
    UNSAFE_ACT,
    UNSAFE_CONDITION,
    FIRE_INCIDENT,
    PERMIT_TO_WORK,
    BEHAVIOUR_BASED,
    SAFETY_VIOLATION
}
