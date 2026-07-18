package com.company.ehs.exception;

/** Thrown for invalid requests the DTO validation cannot express; mapped to HTTP 400. */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
