package com.mayihelpyou.controller;

import com.mayihelpyou.dto.AnalysisRequest;
import com.mayihelpyou.dto.AnalysisResponse;
import com.mayihelpyou.dto.ApiResponse;
import com.mayihelpyou.dto.HistorySummaryDto;
import com.mayihelpyou.security.UserPrincipal;
import com.mayihelpyou.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analyze")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyze(
            @Valid @RequestBody AnalysisRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        AnalysisResponse response = analysisService.analyzeResume(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Match analysis completed", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<HistorySummaryDto>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<HistorySummaryDto> history = analysisService.getUserHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("History retrieved successfully", history));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnalysisResponse>> getAnalysisById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {

        AnalysisResponse response = analysisService.getAnalysisById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Analysis details retrieved", response));
    }
}
