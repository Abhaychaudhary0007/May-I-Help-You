package com.mayihelpyou.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resume_analyses")
public class ResumeAnalysis {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String resumeId;

    private String targetRole;

    private String resumeFilename;

    private String jdText;

    private int matchScore; // 0-100

    @Builder.Default
    private List<String> missingKeywords = new ArrayList<>();

    @Builder.Default
    private List<SkillGapItem> skillGaps = new ArrayList<>();

    @Builder.Default
    private List<String> formatSuggestions = new ArrayList<>();

    @Builder.Default
    private List<String> improvementSuggestions = new ArrayList<>();

    @Builder.Default
    private List<String> roleTrendingSkills = new ArrayList<>();

    @Builder.Default
    private Instant analyzedAt = Instant.now();
}
