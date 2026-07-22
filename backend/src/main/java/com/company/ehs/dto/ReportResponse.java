package com.company.ehs.dto;

import com.company.ehs.domain.NonEmployeeType;
import com.company.ehs.domain.PersonKind;
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
        PersonKind personKind,
        String employeeId,
        String employeeName,
        String designation,
        NonEmployeeType nonEmployeeType,
        String nonEmployeeOtherDesc,
        List<ReportType> reportTypes,
        Character shift,
        ReporterCategory reporterCategory,
        Severity severity,
        String location,
        LocalDate eventDate,
        LocalTime eventTime,
        String reportDescription,
        String correctiveAction,
        ReportStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ChecklistItemResponse> checklist) {
}
