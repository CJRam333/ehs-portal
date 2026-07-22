package com.company.ehs.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "person_kind", nullable = false, length = 20)
    private PersonKind personKind = PersonKind.EMPLOYEE;

    // Nullable: non-employees have no employee id.
    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "employee_name", nullable = false, length = 150)
    private String employeeName;

    // Nullable: only asked on the employee path.
    @Column(name = "designation", length = 150)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(name = "non_employee_type", length = 20)
    private NonEmployeeType nonEmployeeType;

    @Column(name = "non_employee_other_desc", length = 255)
    private String nonEmployeeOtherDesc;

    // Up to 3 report types, stored in the child table report_type(report_id, type).
    @ElementCollection
    @CollectionTable(name = "report_type", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "type", length = 40)
    @Enumerated(EnumType.STRING)
    private Set<ReportType> reportTypes = new LinkedHashSet<>();

    @Column(name = "shift", length = 1)
    private Character shift;

    @Enumerated(EnumType.STRING)
    @Column(name = "reporter_category", length = 20)
    private ReporterCategory reporterCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 10)
    private Severity severity;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "event_time")
    private LocalTime eventTime;

    @Column(name = "report_description", columnDefinition = "TEXT")
    private String reportDescription;

    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 12)
    private ReportStatus status = ReportStatus.DRAFT;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItem> checklistItems = new ArrayList<>();

    public Report() {
    }

    public void addChecklistItem(ChecklistItem item) {
        checklistItems.add(item);
        item.setReport(this);
    }

    public void removeChecklistItem(ChecklistItem item) {
        checklistItems.remove(item);
        item.setReport(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PersonKind getPersonKind() {
        return personKind;
    }

    public void setPersonKind(PersonKind personKind) {
        this.personKind = personKind;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public NonEmployeeType getNonEmployeeType() {
        return nonEmployeeType;
    }

    public void setNonEmployeeType(NonEmployeeType nonEmployeeType) {
        this.nonEmployeeType = nonEmployeeType;
    }

    public String getNonEmployeeOtherDesc() {
        return nonEmployeeOtherDesc;
    }

    public void setNonEmployeeOtherDesc(String nonEmployeeOtherDesc) {
        this.nonEmployeeOtherDesc = nonEmployeeOtherDesc;
    }

    public Set<ReportType> getReportTypes() {
        return reportTypes;
    }

    public void setReportTypes(Set<ReportType> reportTypes) {
        this.reportTypes = reportTypes;
    }

    public Character getShift() {
        return shift;
    }

    public void setShift(Character shift) {
        this.shift = shift;
    }

    public ReporterCategory getReporterCategory() {
        return reporterCategory;
    }

    public void setReporterCategory(ReporterCategory reporterCategory) {
        this.reporterCategory = reporterCategory;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalTime eventTime) {
        this.eventTime = eventTime;
    }

    public String getReportDescription() {
        return reportDescription;
    }

    public void setReportDescription(String reportDescription) {
        this.reportDescription = reportDescription;
    }

    public String getCorrectiveAction() {
        return correctiveAction;
    }

    public void setCorrectiveAction(String correctiveAction) {
        this.correctiveAction = correctiveAction;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<ChecklistItem> getChecklistItems() {
        return checklistItems;
    }

    public void setChecklistItems(List<ChecklistItem> checklistItems) {
        this.checklistItems = checklistItems;
    }
}
