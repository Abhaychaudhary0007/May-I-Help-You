package com.mayihelpyou.service;

import com.mayihelpyou.dto.RoleTrendDto;
import com.mayihelpyou.dto.gemini.GeminiTrendResult;
import com.mayihelpyou.model.RoleTrend;
import com.mayihelpyou.repository.RoleTrendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleTrendService {

    private final RoleTrendRepository roleTrendRepository;
    private final GeminiService geminiService;

    public static final List<String> SUPPORTED_ROLES = Arrays.asList(
            "Backend Developer",
            "Frontend Developer",
            "Full Stack Developer",
            "DevOps Engineer",
            "Cloud Architect",
            "Data Analyst / Engineer",
            "Machine Learning / AI Engineer",
            "Mobile App Developer",
            "QA Automation Engineer",
            "Technical Product Manager"
    );

    public List<RoleTrendDto> getAllTrends() {
        List<RoleTrend> trends = roleTrendRepository.findAll();
        if (trends.isEmpty()) {
            initDefaultTrendsIfEmpty();
            trends = roleTrendRepository.findAll();
        }
        return trends.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public Optional<RoleTrend> getTrendForRole(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return Optional.empty();
        }
        return roleTrendRepository.findByRoleNameIgnoreCase(roleName.trim());
    }

    public List<RoleTrendDto> refreshAllTrends() {
        log.info("Refreshing market trends for all {} supported roles...", SUPPORTED_ROLES.size());
        for (String roleName : SUPPORTED_ROLES) {
            try {
                GeminiTrendResult trendResult = geminiService.fetchRoleTrends(roleName);
                RoleTrend trend = roleTrendRepository.findByRoleNameIgnoreCase(roleName)
                        .orElse(RoleTrend.builder().roleName(roleName).build());

                trend.setTrendingSkills(trendResult.getTrendingSkills());
                trend.setTrendingTools(trendResult.getTrendingTools());
                trend.setInDemandKeywords(trendResult.getInDemandKeywords());
                trend.setDescription(trendResult.getDescription());
                trend.setLastUpdated(Instant.now());

                roleTrendRepository.save(trend);
                log.info("Successfully updated market trends for role: {}", roleName);
            } catch (Exception ex) {
                log.error("Failed to update trends for role: {}", roleName, ex);
            }
        }
        return getAllTrends();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initDefaultTrendsIfEmpty() {
        try {
            if (roleTrendRepository.count() == 0) {
                log.info("Role trends collection is empty. Seeding initial baseline trends for {} roles...", SUPPORTED_ROLES.size());
                for (String roleName : SUPPORTED_ROLES) {
                    GeminiTrendResult fallback = geminiService.generateDefaultTrends(roleName);
                    RoleTrend trend = RoleTrend.builder()
                            .roleName(roleName)
                            .trendingSkills(fallback.getTrendingSkills())
                            .trendingTools(fallback.getTrendingTools())
                            .inDemandKeywords(fallback.getInDemandKeywords())
                            .description(fallback.getDescription())
                            .lastUpdated(Instant.now())
                            .build();
                    roleTrendRepository.save(trend);
                }
                log.info("Role trends baseline seeded successfully.");
            }
        } catch (Exception ex) {
            log.warn("Could not check/seed default role trends on startup (MongoDB might be initializing): {}", ex.getMessage());
        }
    }

    private RoleTrendDto mapToDto(RoleTrend trend) {
        return RoleTrendDto.builder()
                .id(trend.getId())
                .roleName(trend.getRoleName())
                .trendingSkills(trend.getTrendingSkills())
                .trendingTools(trend.getTrendingTools())
                .inDemandKeywords(trend.getInDemandKeywords())
                .description(trend.getDescription())
                .lastUpdated(trend.getLastUpdated())
                .build();
    }
}
