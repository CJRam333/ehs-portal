package com.company.ehs.dto;

import com.company.ehs.domain.ChecklistSection;

/** A single checklist row as returned inside a report. */
public record ChecklistItemResponse(
        ChecklistSection section,
        String itemCode,
        String itemLabel,
        String answer) {
}
