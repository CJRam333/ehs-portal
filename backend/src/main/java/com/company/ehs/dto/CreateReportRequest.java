package com.company.ehs.dto;

import com.company.ehs.domain.NonEmployeeType;
import com.company.ehs.domain.PersonKind;
import jakarta.validation.constraints.NotBlank;

/**
 * Body of {@code POST /api/reports}: the reporter identity captured on the
 * first screen. Location is required for everyone; employee id / designation
 * apply only to employees, sub-type only to non-employees.
 */
public record CreateReportRequest(
        PersonKind personKind,
        @NotBlank String name,
        String employeeId,
        String designation,
        NonEmployeeType nonEmployeeType,
        String nonEmployeeOtherDesc,
        @NotBlank String location) {
}
