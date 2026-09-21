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
public class ResumeUploadResponse {
    private String resumeId;
    private String originalFilename;
    private String fileType;
    private long fileSize;
    private int extractedLength;
    private String previewText;
    private Instant uploadedAt;
}
