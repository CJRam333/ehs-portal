package com.company.ehs.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/**
 * Clean error body returned by {@link GlobalExceptionHandler}. {@code fieldErrors}
 * is present only for validation failures.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors) {

    public static ApiError of(int status, String error, String message) {
        return new ApiError(status, error, message, null);
    }
}
