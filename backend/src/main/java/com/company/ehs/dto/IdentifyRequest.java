package com.company.ehs.dto;

import com.company.ehs.domain.NonEmployeeType;
import com.company.ehs.domain.PersonKind;
import jakarta.validation.constraints.NotBlank;

/**
 * Body of {@code POST /api/identify}. Employees supply an employee id and
 * designation; non-employees supply a sub-type (and a description when OTHER).
 * The kind-specific requirements are enforced in the service layer.
 */
public record IdentifyRequest(
        PersonKind personKind,
        @NotBlank String name,
        String employeeId,
        String designation,
        NonEmployeeType nonEmployeeType,
        String nonEmployeeOtherDesc,
        String location) {
}
