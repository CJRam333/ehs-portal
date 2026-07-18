package com.company.ehs.dto;

import com.company.ehs.domain.ReportType;
import com.company.ehs.domain.ReporterCategory;
import com.company.ehs.domain.Severity;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Body of {@code PUT /api/reports/{id}/details}: the Step-1 fields only. All
 * fields are optional so the same payload backs both "Save" (partial) and
 * "Next" (complete). Identity and checklist are not touched here.
 */
public record DetailsRequest(
        ReportType reportType,
        String shift,
        ReporterCategory reporterCategory,
        Severity severity,
        String location,
        LocalDate eventDate,
        LocalTime eventTime,
        String reportDescription,
        String correctiveAction,
        String hodComments,
        String reporterName) {
}
