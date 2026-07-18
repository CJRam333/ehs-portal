package com.company.ehs.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * One element of the {@code PUT /api/reports/{id}/checklist} body. {@code answer}
 * is a free YES/NO string (nullable to clear an answer); unknown item codes are
 * ignored by the service.
 */
public record ChecklistAnswerRequest(
        @NotBlank String itemCode,
        String answer) {
}
