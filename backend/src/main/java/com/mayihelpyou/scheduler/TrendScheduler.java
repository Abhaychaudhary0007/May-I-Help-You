package com.mayihelpyou.scheduler;

import com.mayihelpyou.service.RoleTrendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrendScheduler {

    private final RoleTrendService roleTrendService;

    /**
     * Runs every Monday at 3:00 AM to fetch the latest industry market trends for all supported roles
     */
    @Scheduled(cron = "0 0 3 * * MON")
    public void scheduleWeeklyTrendRefresh() {
        log.info("Starting scheduled weekly market trend refresh via Gemini AI...");
        try {
            roleTrendService.refreshAllTrends();
            log.info("Weekly market trend refresh completed successfully.");
        } catch (Exception ex) {
            log.error("Scheduled market trend refresh failed: {}", ex.getMessage(), ex);
        }
    }
}
