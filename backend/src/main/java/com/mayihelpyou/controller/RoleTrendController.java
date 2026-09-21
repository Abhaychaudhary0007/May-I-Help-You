package com.mayihelpyou.controller;

import com.mayihelpyou.dto.ApiResponse;
import com.mayihelpyou.dto.RoleTrendDto;
import com.mayihelpyou.service.RoleTrendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trends")
@RequiredArgsConstructor
public class RoleTrendController {

    private final RoleTrendService roleTrendService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleTrendDto>>> getAllTrends() {
        List<RoleTrendDto> trends = roleTrendService.getAllTrends();
        return ResponseEntity.ok(ApiResponse.ok("Market trends retrieved successfully", trends));
    }
}
