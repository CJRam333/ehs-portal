package com.company.ehs.dto;

import jakarta.validation.constraints.NotBlank;

/** Body of {@code POST /api/identify}. */
public record IdentifyRequest(
        @NotBlank String name,
        @NotBlank String employeeId,
        @NotBlank String designation) {
}
