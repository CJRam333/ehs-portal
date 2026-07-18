package com.company.ehs.dto;

import com.company.ehs.domain.ReportType;
import com.company.ehs.domain.ReporterCategory;
import com.company.ehs.domain.Severity;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Body of {@code POST /api/reports}: the reporter identity (required) plus any
 * optional Step-1 fields already known at creation time.
 */
public record CreateReportRequest(
        @NotBlank String name,
        @NotBlank String employeeId,
        @NotBlank String designation,
        ReportType reportType,
        String shift,
        ReporterCategory reporterCategory,
        Severity severity,
        String location,
        LocalDate eventDate,
        LocalTime eventTime,
        String reportDescription,
        String correctiveAction) {
}
