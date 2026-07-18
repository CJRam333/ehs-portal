package com.company.ehs.domain;

/**
 * Section grouping a checklist item belongs to. Stored as STRING in
 * {@code checklist_item.section} (VARCHAR(30)). The canonical set of sections
 * and their items lives in {@code com.company.ehs.checklist.ChecklistTemplate}.
 */
public enum ChecklistSection {
    PPE,
    BEHAVIOUR,
    TOOLS,
    RISK,
    PROCEDURES
}
