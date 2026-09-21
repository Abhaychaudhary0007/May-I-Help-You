package com.mayihelpyou.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {

    /**
     * ID of an uploaded resume (from /api/resume/upload)
     */
    private String resumeId;

    /**
     * Optional direct resume text if user pasted it directly
     */
    private String resumeText;

    @NotBlank(message = "Job description text is required")
    private String jdText;

    /**
     * Selected target role (e.g. "Backend Developer", "DevOps Engineer", etc.)
     */
    private String targetRole;
}
