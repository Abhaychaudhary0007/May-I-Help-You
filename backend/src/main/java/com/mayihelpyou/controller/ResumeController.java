package com.mayihelpyou.controller;

import com.mayihelpyou.dto.ApiResponse;
import com.mayihelpyou.dto.ResumeUploadResponse;
import com.mayihelpyou.security.UserPrincipal;
import com.mayihelpyou.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final AnalysisService analysisService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeUploadResponse>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {

        String userId = principal != null ? principal.getId() : "anonymous";
        ResumeUploadResponse response = analysisService.uploadResume(file, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Resume uploaded and parsed successfully", response));
    }
}
