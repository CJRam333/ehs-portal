package com.company.ehs.dto;

import com.company.ehs.domain.ReportStatus;
import com.company.ehs.domain.ReportType;
import com.company.ehs.domain.ReporterCategory;
import com.company.ehs.domain.Severity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/** Full report view returned by every report endpoint (includes the checklist). */
public record ReportResponse(
        Long id,
        String employeeId,
        String employeeName,
        String designation,
        ReportType reportType,
        Character shift,
        ReporterCategory reporterCategory,
        Severity severity,
        String location,
        LocalDate eventDate,
        LocalTime eventTime,
        String reportDescription,
        String correctiveAction,
        String hodComments,
        String reporterName,
        ReportStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ChecklistItemResponse> checklist) {
}
