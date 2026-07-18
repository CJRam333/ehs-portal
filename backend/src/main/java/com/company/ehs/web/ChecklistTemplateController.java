package com.company.ehs.web;

import com.company.ehs.checklist.ChecklistTemplate;
import com.company.ehs.domain.ChecklistSection;
import com.company.ehs.dto.ChecklistTemplateResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ChecklistTemplateController {

    /** Endpoint 7: the canonical template, grouped by section in display order. */
    @GetMapping("/checklist-template")
    public ChecklistTemplateResponse template() {
        Map<ChecklistSection, List<ChecklistTemplateResponse.Item>> grouped = new LinkedHashMap<>();
        for (ChecklistTemplate.TemplateItem item : ChecklistTemplate.ITEMS) {
            grouped.computeIfAbsent(item.section(), s -> new ArrayList<>())
                    .add(new ChecklistTemplateResponse.Item(item.code(), item.label()));
        }
        List<ChecklistTemplateResponse.Section> sections = grouped.entrySet().stream()
                .map(e -> new ChecklistTemplateResponse.Section(e.getKey(), e.getValue()))
                .toList();
        return new ChecklistTemplateResponse(sections);
    }
}
