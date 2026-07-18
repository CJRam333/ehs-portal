package com.company.ehs.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "checklist_item",
        uniqueConstraints = @UniqueConstraint(name = "uq_report_item", columnNames = {"report_id", "item_code"}))
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false,
            foreignKey = @jakarta.persistence.ForeignKey(name = "fk_checklist_report"))
    private Report report;

    @Enumerated(EnumType.STRING)
    @Column(name = "section", nullable = false, length = 30)
    private ChecklistSection section;

    @Column(name = "item_code", nullable = false, length = 20)
    private String itemCode;

    @Column(name = "item_label", nullable = false, length = 255)
    private String itemLabel;

    @Column(name = "answer", length = 3)
    private String answer;

    public ChecklistItem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Report getReport() {
        return report;
    }

    public void setReport(Report report) {
        this.report = report;
    }

    public ChecklistSection getSection() {
        return section;
    }

    public void setSection(ChecklistSection section) {
        this.section = section;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public String getItemLabel() {
        return itemLabel;
    }

    public void setItemLabel(String itemLabel) {
        this.itemLabel = itemLabel;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
