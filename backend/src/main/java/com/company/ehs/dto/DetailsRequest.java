package com.company.ehs.dto;

import com.company.ehs.domain.ReportType;
import com.company.ehs.domain.ReporterCategory;
import com.company.ehs.domain.Severity;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Body of {@code PUT /api/reports/{id}/details}: the Step-1 fields only. All
 * fields are optional so the same payload backs both "Save" (partial) and
 * "Next" (complete). Identity, location and checklist are not touched here.
 * {@code reportTypes} may hold up to 3 values (enforced in the service).
 */
public record DetailsRequest(
        List<ReportType> reportTypes,
        String shift,
        ReporterCategory reporterCategory,
        Severity severity,
        LocalDate eventDate,
        LocalTime eventTime,
        String reportDescription,
        String correctiveAction) {
}
