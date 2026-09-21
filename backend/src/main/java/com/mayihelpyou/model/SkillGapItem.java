package com.mayihelpyou.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapItem {
    private String skill;
    /**
     * "present", "missing", or "partial"
     */
    private String status;
}
