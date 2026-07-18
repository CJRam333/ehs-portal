package com.company.ehs.dto;

import com.company.ehs.domain.ChecklistSection;
import java.util.List;

/** Response of {@code GET /api/checklist-template}: items grouped by section. */
public record ChecklistTemplateResponse(List<Section> sections) {

    public record Section(ChecklistSection section, List<Item> items) {
    }

    public record Item(String code, String label) {
    }
}
