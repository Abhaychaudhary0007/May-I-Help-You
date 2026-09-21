package com.mayihelpyou.dto;

import com.mayihelpyou.model.SkillGapItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {
    private String id;
    private String resumeId;
    private String resumeFilename;
    private String targetRole;
    private String jdPreview;
    private int matchScore; // 0-100
    private List<String> missingKeywords;
    private List<SkillGapItem> skillGaps;
    private List<String> formatSuggestions;
    private List<String> improvementSuggestions;
    private List<String> roleTrendingSkills;
    private Instant analyzedAt;
}
