package com.company.ehs.repository;

import com.company.ehs.domain.Report;
import com.company.ehs.domain.ReportStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * Exact-key draft lookup: the most recently updated report for an employee
     * with the given status. Fuzzy name/designation matching is done in the
     * service layer (Phase 2) with apache-commons-text, not in SQL.
     */
    Optional<Report> findFirstByEmployeeIdAndStatusOrderByUpdatedAtDesc(String employeeId, ReportStatus status);
}
