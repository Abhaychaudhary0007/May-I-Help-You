package com.mayihelpyou.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

public class GeminiApiModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private List<Content> contents;
        private GenerationConfig generationConfig;

        public static Request fromPrompt(String prompt) {
            return Request.builder()
                    .contents(Collections.singletonList(
                            Content.builder()
                                    .parts(Collections.singletonList(Part.builder().text(prompt).build()))
                                    .build()
                    ))
                    .generationConfig(GenerationConfig.builder()
                            .responseMimeType("application/json")
                            .temperature(0.2)
                            .build())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Part {
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerationConfig {
        @JsonProperty("response_mime_type")
        private String responseMimeType;
        private Double temperature;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        private List<Candidate> candidates;

        public String getFirstText() {
            if (candidates != null && !candidates.isEmpty()) {
                Candidate candidate = candidates.get(0);
                if (candidate.getContent() != null && candidate.getContent().getParts() != null && !candidate.getContent().getParts().isEmpty()) {
                    return candidate.getContent().getParts().get(0).getText();
                }
            }
            return null;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        private Content content;
        private String finishReason;
    }
}
