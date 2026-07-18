package com.company.ehs.web;

import com.company.ehs.dto.ChecklistAnswerRequest;
import com.company.ehs.dto.CreateReportRequest;
import com.company.ehs.dto.DetailsRequest;
import com.company.ehs.dto.IdentifyRequest;
import com.company.ehs.dto.IdentifyResponse;
import com.company.ehs.dto.ReportResponse;
import com.company.ehs.service.ReportService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/identify")
    public IdentifyResponse identify(@Valid @RequestBody IdentifyRequest request) {
        return reportService.identify(request);
    }

    @PostMapping("/reports")
    public ResponseEntity<ReportResponse> create(@Valid @RequestBody CreateReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(request));
    }

    @PutMapping("/reports/{id}/details")
    public ReportResponse updateDetails(@PathVariable Long id, @Valid @RequestBody DetailsRequest request) {
        return reportService.updateDetails(id, request);
    }

    @PutMapping("/reports/{id}/checklist")
    public ReportResponse updateChecklist(@PathVariable Long id,
            @RequestBody List<@Valid ChecklistAnswerRequest> answers) {
        return reportService.updateChecklist(id, answers);
    }

    @PostMapping("/reports/{id}/submit")
    public ReportResponse submit(@PathVariable Long id) {
        return reportService.submit(id);
    }

    @GetMapping("/reports/{id}")
    public ReportResponse get(@PathVariable Long id) {
        return reportService.get(id);
    }
}
