package com.mayihelpyou.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mayihelpyou.dto.gemini.GeminiAnalysisResult;
import com.mayihelpyou.dto.gemini.GeminiTrendResult;
import com.mayihelpyou.model.RoleTrend;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeminiServiceTest {

    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();
        geminiService = new GeminiService(restTemplate, objectMapper);
    }

    @Test
    void testExtractJsonFromMarkdownFences() {
        String input = "```json\n{\n  \"matchScore\": 85,\n  \"missingKeywords\": [\"Docker\"]\n}\n```";
        String extracted = geminiService.extractJson(input);
        assertTrue(extracted.contains("\"matchScore\": 85"));
        assertFalse(extracted.contains("```json"));
    }

    @Test
    void testParseAnalysisResponse() {
        String validJson = "{\n" +
                "  \"matchScore\": 88,\n" +
                "  \"missingKeywords\": [\"Kubernetes\", \"Kafka\"],\n" +
                "  \"skillGaps\": [{\"skill\": \"Java\", \"status\": \"present\"}],\n" +
                "  \"formatSuggestions\": [\"Add quantifiable metrics\"],\n" +
                "  \"improvementSuggestions\": [\"Include cloud deployment experience\"]\n" +
                "}";

        GeminiAnalysisResult result = geminiService.parseAnalysisResponse(validJson);
        assertNotNull(result);
        assertEquals(88, result.getMatchScore());
        assertEquals(2, result.getMissingKeywords().size());
        assertEquals("Kubernetes", result.getMissingKeywords().get(0));
        assertEquals(1, result.getSkillGaps().size());
        assertEquals("present", result.getSkillGaps().get(0).getStatus());
    }

    @Test
    void testParseTrendResponse() {
        String validJson = "{\n" +
                "  \"trendingSkills\": [\"React 18\", \"TypeScript\"],\n" +
                "  \"trendingTools\": [\"Vite\", \"Tailwind\"],\n" +
                "  \"inDemandKeywords\": [\"Micro-Frontends\"],\n" +
                "  \"description\": \"Frontend demand is high\"\n" +
                "}";

        GeminiTrendResult result = geminiService.parseTrendResponse(validJson);
        assertNotNull(result);
        assertEquals(2, result.getTrendingSkills().size());
        assertEquals("React 18", result.getTrendingSkills().get(0));
        assertEquals("Frontend demand is high", result.getDescription());
    }

    @Test
    void testOfflineFallbackGeneratesSensibleScoreAndSuggestions() {
        String resume = "Senior Java Developer experienced in Spring Boot, REST APIs, Microservices, SQL, and Docker.";
        String jd = "We are seeking a Backend Engineer skilled in Java, Spring Boot, Microservices, Kubernetes, and Kafka.";

        RoleTrend trend = RoleTrend.builder()
                .roleName("Backend Developer")
                .trendingSkills(List.of("Java", "Spring Boot", "Kafka", "Kubernetes"))
                .build();

        GeminiAnalysisResult result = geminiService.generateOfflineAnalysisFallback(resume, jd, "Backend Developer", trend);

        assertNotNull(result);
        assertTrue(result.getMatchScore() > 0 && result.getMatchScore() <= 100);
        assertFalse(result.getFormatSuggestions().isEmpty());
        assertFalse(result.getImprovementSuggestions().isEmpty());
        assertTrue(result.getSkillGaps().stream().anyMatch(s -> s.getSkill().equalsIgnoreCase("Java") && s.getStatus().equals("present")));
    }

    @Test
    void testObjectMapperWithJavaTimeModule() {
        com.mayihelpyou.config.AppConfig config = new com.mayihelpyou.config.AppConfig();
        ObjectMapper mapper = config.objectMapper();
        com.mayihelpyou.dto.ResumeUploadResponse response = com.mayihelpyou.dto.ResumeUploadResponse.builder()
                .resumeId("test-123")
                .uploadedAt(java.time.Instant.now())
                .build();
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> {
            String json = mapper.writeValueAsString(response);
            assertNotNull(json);
            assertTrue(json.contains("test-123"));
        });
    }
}
