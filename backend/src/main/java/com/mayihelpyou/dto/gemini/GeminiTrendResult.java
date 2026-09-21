package com.mayihelpyou.dto.gemini;

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
public class GeminiTrendResult {
    @Builder.Default
    private List<String> trendingSkills = new ArrayList<>();
    @Builder.Default
    private List<String> trendingTools = new ArrayList<>();
    @Builder.Default
    private List<String> inDemandKeywords = new ArrayList<>();
    private String description;
}
