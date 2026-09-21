package com.mayihelpyou.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mayihelpyou.dto.gemini.GeminiAnalysisResult;
import com.mayihelpyou.dto.gemini.GeminiApiModels;
import com.mayihelpyou.dto.gemini.GeminiTrendResult;
import com.mayihelpyou.exception.MalformedAIResponseException;
import com.mayihelpyou.model.RoleTrend;
import com.mayihelpyou.model.SkillGapItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiApiUrl;

    public GeminiAnalysisResult analyzeMatch(String resumeText, String jdText, String targetRole, RoleTrend roleTrend) {
        String prompt = buildMatchPrompt(resumeText, jdText, targetRole, roleTrend);

        if (!StringUtils.hasText(geminiApiKey)) {
            log.warn("GEMINI_API_KEY is not configured! Generating offline heuristic ATS analysis.");
            return generateOfflineAnalysisFallback(resumeText, jdText, targetRole, roleTrend);
        }

        // Try API call with 1 retry
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                String rawResponse = callGeminiRaw(prompt);
                return parseAnalysisResponse(rawResponse);
            } catch (Exception ex) {
                log.warn("Gemini match analysis attempt {} failed: {}", attempt, ex.getMessage());
                if (attempt == 2) {
                    log.error("All Gemini API attempts failed. Falling back to resilient ATS heuristic parser.", ex);
                    return generateOfflineAnalysisFallback(resumeText, jdText, targetRole, roleTrend);
                }
            }
        }
        return generateOfflineAnalysisFallback(resumeText, jdText, targetRole, roleTrend);
    }

    public GeminiTrendResult fetchRoleTrends(String roleName) {
        String prompt = buildTrendsPrompt(roleName);

        if (!StringUtils.hasText(geminiApiKey)) {
            log.warn("GEMINI_API_KEY is not configured! Using default trend seeds for role: {}", roleName);
            return generateDefaultTrends(roleName);
        }

        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                String rawResponse = callGeminiRaw(prompt);
                return parseTrendResponse(rawResponse);
            } catch (Exception ex) {
                log.warn("Gemini role trend attempt {} failed for {}: {}", attempt, roleName, ex.getMessage());
                if (attempt == 2) {
                    return generateDefaultTrends(roleName);
                }
            }
        }
        return generateDefaultTrends(roleName);
    }

    private String callGeminiRaw(String prompt) {
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        GeminiApiModels.Request requestBody = GeminiApiModels.Request.fromPrompt(prompt);
        HttpEntity<GeminiApiModels.Request> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<GeminiApiModels.Response> response = restTemplate.postForEntity(url, entity, GeminiApiModels.Response.class);

        if (response.getBody() == null) {
            throw new MalformedAIResponseException("Empty response received from Gemini API");
        }

        String text = response.getBody().getFirstText();
        if (!StringUtils.hasText(text)) {
            throw new MalformedAIResponseException("Gemini returned empty candidate text");
        }

        return text;
    }

    public GeminiAnalysisResult parseAnalysisResponse(String text) {
        String cleanedJson = extractJson(text);
        try {
            GeminiAnalysisResult result = objectMapper.readValue(cleanedJson, GeminiAnalysisResult.class);
            if (result.getMatchScore() < 0) result.setMatchScore(0);
            if (result.getMatchScore() > 100) result.setMatchScore(100);
            if (result.getMissingKeywords() == null) result.setMissingKeywords(new ArrayList<>());
            if (result.getSkillGaps() == null) result.setSkillGaps(new ArrayList<>());
            if (result.getFormatSuggestions() == null) result.setFormatSuggestions(new ArrayList<>());
            if (result.getImprovementSuggestions() == null) result.setImprovementSuggestions(new ArrayList<>());
            return result;
        } catch (JsonProcessingException ex) {
            log.error("Failed to parse Gemini JSON: {}\nRaw text: {}", ex.getMessage(), text);
            throw new MalformedAIResponseException("Failed to parse AI JSON response: " + ex.getMessage(), ex);
        }
    }

    public GeminiTrendResult parseTrendResponse(String text) {
        String cleanedJson = extractJson(text);
        try {
            return objectMapper.readValue(cleanedJson, GeminiTrendResult.class);
        } catch (JsonProcessingException ex) {
            log.error("Failed to parse Gemini Trend JSON: {}\nRaw text: {}", ex.getMessage(), text);
            throw new MalformedAIResponseException("Failed to parse AI Trend JSON: " + ex.getMessage(), ex);
        }
    }

    public String extractJson(String text) {
        if (text == null) return "{}";
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();
        int firstBrace = trimmed.indexOf('{');
        int lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return trimmed.substring(firstBrace, lastBrace + 1);
        }
        return trimmed;
    }

    private String buildMatchPrompt(String resumeText, String jdText, String targetRole, RoleTrend roleTrend) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert ATS (Applicant Tracking System) analyst, senior technical recruiter, and hiring manager.\n");
        sb.append("Your task is to analyze the candidate's Resume against the provided Job Description (JD).\n\n");

        if (StringUtils.hasText(targetRole)) {
            sb.append("Target Role: ").append(targetRole).append("\n");
        }

        if (roleTrend != null && roleTrend.getTrendingSkills() != null && !roleTrend.getTrendingSkills().isEmpty()) {
            sb.append("Current Industry Market Trends for this role:\n");
            sb.append("- In-Demand Skills: ").append(String.join(", ", roleTrend.getTrendingSkills())).append("\n");
            if (roleTrend.getTrendingTools() != null && !roleTrend.getTrendingTools().isEmpty()) {
                sb.append("- Popular Tools: ").append(String.join(", ", roleTrend.getTrendingTools())).append("\n");
            }
            if (roleTrend.getInDemandKeywords() != null && !roleTrend.getInDemandKeywords().isEmpty()) {
                sb.append("- Trending Keywords: ").append(String.join(", ", roleTrend.getInDemandKeywords())).append("\n");
            }
            sb.append("\n");
        }

        sb.append("=== CANDIDATE RESUME TEXT ===\n");
        sb.append(resumeText).append("\n\n");

        sb.append("=== JOB DESCRIPTION (JD) ===\n");
        sb.append(jdText).append("\n\n");

        sb.append("EVALUATION CRITERIA:\n");
        sb.append("1. Compute an accurate ATS Match Score from 0 to 100 based on core skill alignment, experience relevance, keywords, and qualifications.\n");
        sb.append("2. Identify key missing keywords mentioned in the JD that are absent from the resume.\n");
        sb.append("3. Perform a detailed Skill Gap Analysis list with status 'present', 'missing', or 'partial'.\n");
        sb.append("4. Provide concise ATS resume format suggestions (layout, bullet structure, metrics, quantifiable achievements).\n");
        sb.append("5. Provide high-impact actionable improvement suggestions to tailor this resume specifically for this job description.\n\n");

        sb.append("OUTPUT REQUIREMENTS:\n");
        sb.append("You must respond ONLY in strict JSON matching this exact schema with NO extraneous text or explanation:\n");
        sb.append("{\n");
        sb.append("  \"matchScore\": number,\n");
        sb.append("  \"missingKeywords\": [\"string\"],\n");
        sb.append("  \"skillGaps\": [\n");
        sb.append("    {\"skill\": \"string\", \"status\": \"present\" | \"missing\" | \"partial\"}\n");
        sb.append("  ],\n");
        sb.append("  \"formatSuggestions\": [\"string\"],\n");
        sb.append("  \"improvementSuggestions\": [\"string\"]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private String buildTrendsPrompt(String roleName) {
        return "You are an expert tech talent market researcher and recruiter.\n" +
                "Provide the latest market trends, top in-demand skills, top tools/frameworks, and high-frequency ATS keywords for the job role: \"" + roleName + "\".\n\n" +
                "Output ONLY a strict JSON object with this exact schema:\n" +
                "{\n" +
                "  \"trendingSkills\": [\"string\"],\n" +
                "  \"trendingTools\": [\"string\"],\n" +
                "  \"inDemandKeywords\": [\"string\"],\n" +
                "  \"description\": \"string summary of market demand\"\n" +
                "}\n";
    }

    public GeminiAnalysisResult generateOfflineAnalysisFallback(String resumeText, String jdText, String targetRole, RoleTrend roleTrend) {
        String lowerResume = resumeText != null ? resumeText.toLowerCase() : "";
        String lowerJd = jdText != null ? jdText.toLowerCase() : "";

        List<String> checkSkills = new ArrayList<>(Arrays.asList(
                "java", "spring boot", "react", "javascript", "typescript", "python",
                "docker", "kubernetes", "aws", "gcp", "azure", "mongodb", "postgresql",
                "sql", "git", "ci/cd", "rest api", "microservices", "graphql", "redis",
                "unit testing", "agile", "system design", "html", "css", "tailwind"
        ));

        if (roleTrend != null && roleTrend.getTrendingSkills() != null) {
            for (String ts : roleTrend.getTrendingSkills()) {
                if (!checkSkills.contains(ts.toLowerCase())) {
                    checkSkills.add(ts.toLowerCase());
                }
            }
        }

        List<SkillGapItem> gaps = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        int matchedCount = 0;
        int jdMentionedCount = 0;

        for (String skill : checkSkills) {
            boolean inJd = lowerJd.contains(skill);
            boolean inResume = lowerResume.contains(skill);

            if (inJd) {
                jdMentionedCount++;
                if (inResume) {
                    matchedCount++;
                    gaps.add(new SkillGapItem(capitalize(skill), "present"));
                } else {
                    missingKeywords.add(capitalize(skill));
                    gaps.add(new SkillGapItem(capitalize(skill), "missing"));
                }
            } else if (inResume) {
                gaps.add(new SkillGapItem(capitalize(skill), "present"));
            }
        }

        int score = jdMentionedCount > 0 ? (int) Math.round(((double) matchedCount / jdMentionedCount) * 100) : 75;
        if (score < 30 && matchedCount > 0) score = 45;
        if (score > 95) score = 95;

        List<String> formatSuggestions = List.of(
                "Use standard ATS-friendly headings (e.g., 'Work Experience', 'Technical Skills', 'Education').",
                "Quantify bullet points with impact metrics (e.g., 'Reduced query latency by 35%', 'Scaled service to 50k DAU').",
                "Ensure consistent date formatting (e.g., 'Month Year - Month Year') and avoid multi-column layouts."
        );

        List<String> improvementSuggestions = List.of(
                "Explicitly incorporate key missing terms (" + String.join(", ", missingKeywords.stream().limit(3).toList()) + ") into your recent project descriptions.",
                "Align your summary statement with the '" + (targetRole != null ? targetRole : "target role") + "' specifications.",
                "Detail your hands-on experience with modern cloud and distributed architectures mentioned in the job description."
        );

        return GeminiAnalysisResult.builder()
                .matchScore(score)
                .missingKeywords(missingKeywords)
                .skillGaps(gaps)
                .formatSuggestions(formatSuggestions)
                .improvementSuggestions(improvementSuggestions)
                .build();
    }

    public GeminiTrendResult generateDefaultTrends(String roleName) {
        String role = roleName != null ? roleName.toLowerCase() : "";
        List<String> skills;
        List<String> tools;
        List<String> keywords;
        String desc;

        if (role.contains("frontend")) {
            skills = List.of("React 18+", "TypeScript", "Next.js", "State Management (Redux/Zustand)", "Tailwind CSS", "Web Performance & Core Web Vitals");
            tools = List.of("Vite", "Webpack", "Playwright", "Jest", "Figma", "Storybook");
            keywords = List.of("Responsive Design", "Accessibility (a11y)", "Micro-Frontends", "SSR/SSG", "SPA Architecture");
            desc = "High demand for TypeScript proficiency, component architecture, and modern SSR/state frameworks.";
        } else if (role.contains("devops") || role.contains("cloud")) {
            skills = List.of("Kubernetes (K8s)", "Docker", "Terraform / IaC", "CI/CD Pipelines", "AWS / GCP", "Observability & Monitoring");
            tools = List.of("GitHub Actions", "ArgoCD", "Prometheus", "Grafana", "Helm", "Ansible");
            keywords = List.of("GitOps", "Zero Trust Security", "Cloud Cost Optimization (FinOps)", "Site Reliability Engineering (SRE)");
            desc = "Critical need for Infrastructure as Code, automated GitOps delivery, and cloud-native resilience.";
        } else if (role.contains("data") || role.contains("ml") || role.contains("ai")) {
            skills = List.of("Python", "SQL & Query Optimization", "Generative AI & LLMs", "Data Pipelines (ETL/ELT)", "Apache Spark", "Vector Databases");
            tools = List.of("Airflow", "dbt", "Snowflake", "BigQuery", "LangChain", "Docker");
            keywords = List.of("RAG Architecture", "Feature Engineering", "Data Modeling", "Predictive Analytics", "MLOps");
            desc = "Rapidly expanding market demand for LLM integration, Vector search, and robust real-time data pipelines.";
        } else {
            skills = List.of("Java 21 / Spring Boot 3", "Microservices Architecture", "RESTful & GraphQL APIs", "PostgreSQL / MongoDB", "Docker & Kubernetes", "Distributed Caching (Redis)");
            tools = List.of("Maven/Gradle", "Postman", "Kafka / RabbitMQ", "GitHub Actions", "IntelliJ IDEA", "Datadog");
            keywords = List.of("High Concurrency", "Event-Driven Architecture", "ACID Transactions", "Scalability", "System Design");
            desc = "Strong emphasis on distributed systems, event-driven backends, and cloud-native microservice engineering.";
        }

        return GeminiTrendResult.builder()
                .trendingSkills(skills)
                .trendingTools(tools)
                .inDemandKeywords(keywords)
                .description(desc)
                .build();
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        String[] parts = text.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
