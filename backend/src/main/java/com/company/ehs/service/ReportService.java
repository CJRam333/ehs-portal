package com.company.ehs.service;

import com.company.ehs.checklist.ChecklistTemplate;
import com.company.ehs.domain.ChecklistItem;
import com.company.ehs.domain.Report;
import com.company.ehs.domain.ReportStatus;
import com.company.ehs.dto.ChecklistAnswerRequest;
import com.company.ehs.dto.ChecklistItemResponse;
import com.company.ehs.dto.CreateReportRequest;
import com.company.ehs.dto.DetailsRequest;
import com.company.ehs.dto.IdentifyRequest;
import com.company.ehs.dto.IdentifyResponse;
import com.company.ehs.dto.ReportResponse;
import com.company.ehs.exception.BadRequestException;
import com.company.ehs.exception.ConflictException;
import com.company.ehs.exception.NotFoundException;
import com.company.ehs.repository.ReportRepository;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    /** Threshold below which a name/designation is treated as a mismatch. */
    private static final double SIMILARITY_THRESHOLD = 0.85;

    private final ReportRepository reportRepository;
    private final EntityManager entityManager;
    private final JaroWinklerSimilarity similarity = new JaroWinklerSimilarity();

    public ReportService(ReportRepository reportRepository, EntityManager entityManager) {
        this.reportRepository = reportRepository;
        this.entityManager = entityManager;
    }

    /** Endpoint 1: resume the most recent DRAFT for an employee, with a fuzzy identity check. */
    @Transactional(readOnly = true)
    public IdentifyResponse identify(IdentifyRequest request) {
        Optional<Report> draft = reportRepository
                .findFirstByEmployeeIdAndStatusOrderByUpdatedAtDesc(request.employeeId(), ReportStatus.DRAFT);
        if (draft.isEmpty()) {
            return IdentifyResponse.none();
        }
        Report report = draft.get();
        double nameSim = similarity.apply(request.name(), report.getEmployeeName());
        double desgSim = similarity.apply(request.designation(), report.getDesignation());
        boolean mismatchWarning = nameSim < SIMILARITY_THRESHOLD || desgSim < SIMILARITY_THRESHOLD;
        return IdentifyResponse.resume(toResponse(report), mismatchWarning);
    }

    /** Endpoint 2: create a DRAFT report and seed its checklist rows from the template. */
    @Transactional
    public ReportResponse create(CreateReportRequest request) {
        Report report = new Report();
        report.setEmployeeId(request.employeeId());
        report.setEmployeeName(request.name());
        report.setDesignation(request.designation());
        report.setStatus(ReportStatus.DRAFT);

        report.setReportType(request.reportType());
        report.setShift(toShift(request.shift()));
        report.setReporterCategory(request.reporterCategory());
        report.setSeverity(request.severity());
        report.setLocation(request.location());
        report.setEventDate(request.eventDate());
        report.setEventTime(request.eventTime());
        report.setReportDescription(request.reportDescription());
        report.setCorrectiveAction(request.correctiveAction());

        for (ChecklistTemplate.TemplateItem tpl : ChecklistTemplate.ITEMS) {
            ChecklistItem item = new ChecklistItem();
            item.setSection(tpl.section());
            item.setItemCode(tpl.code());
            item.setItemLabel(tpl.label());
            item.setAnswer(null);
            report.addChecklistItem(item);
        }

        reportRepository.saveAndFlush(report);
        entityManager.refresh(report);
        return toResponse(report);
    }

    /** Endpoint 3: overwrite the Step-1 fields; DB bumps updated_at on the UPDATE. */
    @Transactional
    public ReportResponse updateDetails(Long id, DetailsRequest request) {
        Report report = require(id);
        report.setReportType(request.reportType());
        report.setShift(toShift(request.shift()));
        report.setReporterCategory(request.reporterCategory());
        report.setSeverity(request.severity());
        report.setLocation(request.location());
        report.setEventDate(request.eventDate());
        report.setEventTime(request.eventTime());
        report.setReportDescription(request.reportDescription());
        report.setCorrectiveAction(request.correctiveAction());
        report.setHodComments(request.hodComments());
        report.setReporterName(request.reporterName());

        reportRepository.saveAndFlush(report);
        entityManager.refresh(report);
        return toResponse(report);
    }

    /** Endpoint 4: upsert answers onto existing rows by item_code; unknown codes are ignored. */
    @Transactional
    public ReportResponse updateChecklist(Long id, List<ChecklistAnswerRequest> answers) {
        Report report = require(id);
        for (ChecklistAnswerRequest answer : answers) {
            report.getChecklistItems().stream()
                    .filter(item -> item.getItemCode().equals(answer.itemCode()))
                    .findFirst()
                    .ifPresent(item -> item.setAnswer(answer.answer()));
        }
        reportRepository.saveAndFlush(report);
        entityManager.refresh(report);
        return toResponse(report);
    }

    /** Endpoint 5: validate the minimum required fields, then mark SUBMITTED. */
    @Transactional
    public ReportResponse submit(Long id) {
        Report report = require(id);
        if (report.getStatus() == ReportStatus.SUBMITTED) {
            throw new ConflictException("Report " + id + " is already submitted");
        }
        if (report.getReportType() == null || report.getSeverity() == null || report.getEventDate() == null) {
            throw new BadRequestException("report_type, severity and event_date are required to submit");
        }
        report.setStatus(ReportStatus.SUBMITTED);
        reportRepository.saveAndFlush(report);
        entityManager.refresh(report);
        return toResponse(report);
    }

    /** Endpoint 6: full report + checklist. */
    @Transactional(readOnly = true)
    public ReportResponse get(Long id) {
        return toResponse(require(id));
    }

    private Report require(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Report " + id + " not found"));
    }

    private static Character toShift(String shift) {
        return (shift == null || shift.isBlank()) ? null : shift.charAt(0);
    }

    private static ReportResponse toResponse(Report report) {
        List<ChecklistItemResponse> checklist = report.getChecklistItems().stream()
                .map(item -> new ChecklistItemResponse(
                        item.getSection(), item.getItemCode(), item.getItemLabel(), item.getAnswer()))
                .toList();
        return new ReportResponse(
                report.getId(),
                report.getEmployeeId(),
                report.getEmployeeName(),
                report.getDesignation(),
                report.getReportType(),
                report.getShift(),
                report.getReporterCategory(),
                report.getSeverity(),
                report.getLocation(),
                report.getEventDate(),
                report.getEventTime(),
                report.getReportDescription(),
                report.getCorrectiveAction(),
                report.getHodComments(),
                report.getReporterName(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getUpdatedAt(),
                checklist);
    }
}
