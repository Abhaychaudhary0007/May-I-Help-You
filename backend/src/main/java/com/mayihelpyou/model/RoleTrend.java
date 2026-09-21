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
@Document(collection = "role_trends")
public class RoleTrend {

    @Id
    private String id;

    @Indexed(unique = true)
    private String roleName;

    @Builder.Default
    private List<String> trendingSkills = new ArrayList<>();

    @Builder.Default
    private List<String> trendingTools = new ArrayList<>();

    @Builder.Default
    private List<String> inDemandKeywords = new ArrayList<>();

    private String description;

    @Builder.Default
    private Instant lastUpdated = Instant.now();
}
