package com.mayihelpyou.dto;

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
public class RoleTrendDto {
    private String id;
    private String roleName;
    private List<String> trendingSkills;
    private List<String> trendingTools;
    private List<String> inDemandKeywords;
    private String description;
    private Instant lastUpdated;
}
