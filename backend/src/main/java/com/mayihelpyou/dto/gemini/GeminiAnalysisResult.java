package com.mayihelpyou.dto.gemini;

import com.mayihelpyou.model.SkillGapItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiAnalysisResult {
    private int matchScore;
    @Builder.Default
    private List<String> missingKeywords = new ArrayList<>();
    @Builder.Default
    private List<SkillGapItem> skillGaps = new ArrayList<>();
    @Builder.Default
    private List<String> formatSuggestions = new ArrayList<>();
    @Builder.Default
    private List<String> improvementSuggestions = new ArrayList<>();
}
