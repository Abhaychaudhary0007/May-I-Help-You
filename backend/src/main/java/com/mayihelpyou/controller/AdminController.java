package com.mayihelpyou.controller;

import com.mayihelpyou.dto.ApiResponse;
import com.mayihelpyou.dto.RoleTrendDto;
import com.mayihelpyou.service.RoleTrendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RoleTrendService roleTrendService;

    @PostMapping("/refresh-trends")
    public ResponseEntity<ApiResponse<List<RoleTrendDto>>> refreshTrends() {
        List<RoleTrendDto> updatedTrends = roleTrendService.refreshAllTrends();
        return ResponseEntity.ok(ApiResponse.ok("Market trends successfully refreshed via Gemini AI", updatedTrends));
    }
}
