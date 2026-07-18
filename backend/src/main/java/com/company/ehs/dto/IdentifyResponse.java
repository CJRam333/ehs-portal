package com.company.ehs.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Response of {@code POST /api/identify}. When {@code resume} is false the
 * {@code report} and {@code mismatchWarning} fields are omitted from the JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record IdentifyResponse(
        boolean resume,
        ReportResponse report,
        Boolean mismatchWarning) {

    public static IdentifyResponse none() {
        return new IdentifyResponse(false, null, null);
    }

    public static IdentifyResponse resume(ReportResponse report, boolean mismatchWarning) {
        return new IdentifyResponse(true, report, mismatchWarning);
    }
}
