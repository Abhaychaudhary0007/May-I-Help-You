package com.mayihelpyou.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentParseResponse {
    private String filename;
    private String fileType;
    private long fileSize;
    private int characterCount;
    private String extractedText;
    private String previewText;
    private Instant parsedAt;
}
