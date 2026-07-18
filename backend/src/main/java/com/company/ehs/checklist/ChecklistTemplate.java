package com.company.ehs.checklist;

import com.company.ehs.domain.ChecklistSection;
import java.util.List;

/**
 * Canonical checklist template — the single source of truth for the sections
 * and items that every report is seeded with. Used by both the seed logic when
 * a report is created and by {@code GET /api/checklist-template}.
 */
public final class ChecklistTemplate {

    private ChecklistTemplate() {
    }

    /** One template row: which section it belongs to, its stable code, and its label. */
    public record TemplateItem(ChecklistSection section, String code, String label) {
    }

    /** Flat, ordered list of every checklist item. Order is the display order. */
    public static final List<TemplateItem> ITEMS = List.of(
            new TemplateItem(ChecklistSection.PPE, "PPE_01", "Head protection – helmet"),
            new TemplateItem(ChecklistSection.PPE, "PPE_02", "Eyes & face – goggles/shields"),
            new TemplateItem(ChecklistSection.PPE, "PPE_03", "Ears – plugs/muffs"),
            new TemplateItem(ChecklistSection.PPE, "PPE_04", "Hands & arms – gloves"),
            new TemplateItem(ChecklistSection.PPE, "PPE_05", "Body – chemical resistant/boiler suit/apron"),
            new TemplateItem(ChecklistSection.PPE, "PPE_06", "Feet & legs – safety shoes/gum boots"),
            new TemplateItem(ChecklistSection.PPE, "PPE_07", "PPE against fall (harness, lifelines)"),
            new TemplateItem(ChecklistSection.PPE, "PPE_08", "Respiratory – masks/SCBA"),

            new TemplateItem(ChecklistSection.BEHAVIOUR, "BEH_01", "Changing attitude while observed"),
            new TemplateItem(ChecklistSection.BEHAVIOUR, "BEH_02", "Irresponsible/rash behaviour"),

            new TemplateItem(ChecklistSection.TOOLS, "TOOL_01", "Adequate for work"),
            new TemplateItem(ChecklistSection.TOOLS, "TOOL_02", "Used correctly"),
            new TemplateItem(ChecklistSection.TOOLS, "TOOL_03", "In good condition"),

            new TemplateItem(ChecklistSection.RISK, "RISK_01", "Machine guarding"),
            new TemplateItem(ChecklistSection.RISK, "RISK_02", "Only authorised doing job"),
            new TemplateItem(ChecklistSection.RISK, "RISK_03", "Hot surfaces/sharp objects"),
            new TemplateItem(ChecklistSection.RISK, "RISK_04", "Electric shock/loose wiring"),
            new TemplateItem(ChecklistSection.RISK, "RISK_05", "Critical equipment, fire & gangways clear"),
            new TemplateItem(ChecklistSection.RISK, "RISK_06", "Chemical exposure/handling safely"),
            new TemplateItem(ChecklistSection.RISK, "RISK_07", "Fire/smouldering/explosion"),
            new TemplateItem(ChecklistSection.RISK, "RISK_08", "Motor vehicle collision/moving objects"),
            new TemplateItem(ChecklistSection.RISK, "RISK_09", "Slips, trips, falls"),
            new TemplateItem(ChecklistSection.RISK, "RISK_10", "Strain (MSD)/foreign object in eye"),
            new TemplateItem(ChecklistSection.RISK, "RISK_11", "Caught in between/striking against"),
            new TemplateItem(ChecklistSection.RISK, "RISK_12", "LOTO in place"),
            new TemplateItem(ChecklistSection.RISK, "RISK_13", "Cylinders chained/proper lifting"),
            new TemplateItem(ChecklistSection.RISK, "RISK_14", "Housekeeping & tidy"),

            new TemplateItem(ChecklistSection.PROCEDURES, "PROC_01", "Needs improvement in procedure/SOP"),
            new TemplateItem(ChecklistSection.PROCEDURES, "PROC_02", "Permit procedure followed"),
            new TemplateItem(ChecklistSection.PROCEDURES, "PROC_03", "Adhered to SOP"));
}
