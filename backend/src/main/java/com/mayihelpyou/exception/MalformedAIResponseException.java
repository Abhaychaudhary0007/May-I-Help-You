package com.mayihelpyou.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class MalformedAIResponseException extends RuntimeException {
    public MalformedAIResponseException(String message) {
        super(message);
    }

    public MalformedAIResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
