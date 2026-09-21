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
public class HistorySummaryDto {
    private String id;
    private String resumeId;
    private String resumeFilename;
    private String targetRole;
    private int matchScore;
    private int missingKeywordsCount;
    private int skillGapsCount;
    private Instant analyzedAt;
}
