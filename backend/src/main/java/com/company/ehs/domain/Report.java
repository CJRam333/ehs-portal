package com.company.ehs.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "employee_name", nullable = false, length = 150)
    private String employeeName;

    @Column(name = "designation", nullable = false, length = 150)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", length = 40)
    private ReportType reportType;

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

    @Column(name = "hod_comments", columnDefinition = "TEXT")
    private String hodComments;

    @Column(name = "reporter_name", length = 150)
    private String reporterName;

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

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
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

    public String getHodComments() {
        return hodComments;
    }

    public void setHodComments(String hodComments) {
        this.hodComments = hodComments;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
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
