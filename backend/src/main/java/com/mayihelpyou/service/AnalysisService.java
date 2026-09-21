package com.mayihelpyou.service;

import com.mayihelpyou.dto.AnalysisRequest;
import com.mayihelpyou.dto.AnalysisResponse;
import com.mayihelpyou.dto.HistorySummaryDto;
import com.mayihelpyou.dto.ResumeUploadResponse;
import com.mayihelpyou.dto.gemini.GeminiAnalysisResult;
import com.mayihelpyou.exception.AppException;
import com.mayihelpyou.exception.ResourceNotFoundException;
import com.mayihelpyou.model.Resume;
import com.mayihelpyou.model.ResumeAnalysis;
import com.mayihelpyou.model.RoleTrend;
import com.mayihelpyou.repository.ResumeAnalysisRepository;
import com.mayihelpyou.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeParserService resumeParserService;
    private final GeminiService geminiService;
    private final RoleTrendService roleTrendService;

    public ResumeUploadResponse uploadResume(MultipartFile file, String userId) {
        String extractedText = resumeParserService.extractText(file);
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String fileType = resumeParserService.getFileExtension(originalFilename);

        Resume resume = Resume.builder()
                .userId(userId)
                .originalFilename(originalFilename)
                .fileType(fileType)
                .fileSize(file.getSize())
                .extractedText(extractedText)
                .uploadedAt(Instant.now())
                .build();

        Resume saved = resumeRepository.save(resume);

        String preview = extractedText.length() > 300 ?
                extractedText.substring(0, 300) + "..." :
                extractedText;

        return ResumeUploadResponse.builder()
                .resumeId(saved.getId())
                .originalFilename(saved.getOriginalFilename())
                .fileType(saved.getFileType())
                .fileSize(saved.getFileSize())
                .extractedLength(extractedText.length())
                .previewText(preview)
                .uploadedAt(saved.getUploadedAt())
                .build();
    }

    public AnalysisResponse analyzeResume(AnalysisRequest request, String userId) {
        String resumeText;
        String resumeFilename = "Pasted Resume";

        if (StringUtils.hasText(request.getResumeId())) {
            Resume resume = resumeRepository.findByIdAndUserId(request.getResumeId(), userId)
                    .or(() -> resumeRepository.findById(request.getResumeId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found with ID: " + request.getResumeId()));
            resumeText = resume.getExtractedText();
            resumeFilename = resume.getOriginalFilename();
        } else if (StringUtils.hasText(request.getResumeText())) {
            resumeText = request.getResumeText().trim();
        } else {
            throw new AppException("Either resumeId (from upload) or resumeText must be provided");
        }

        if (resumeText.isBlank()) {
            throw new AppException("Resume content is empty");
        }

        String targetRole = request.getTargetRole() != null ? request.getTargetRole().trim() : "Software Engineer";
        Optional<RoleTrend> roleTrendOpt = roleTrendService.getTrendForRole(targetRole);
        RoleTrend roleTrend = roleTrendOpt.orElse(null);

        // Call Gemini for structured match analysis
        GeminiAnalysisResult geminiResult = geminiService.analyzeMatch(resumeText, request.getJdText(), targetRole, roleTrend);

        List<String> trendingSkills = roleTrend != null && roleTrend.getTrendingSkills() != null ?
                roleTrend.getTrendingSkills() : new ArrayList<>();

        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .userId(userId)
                .resumeId(request.getResumeId())
                .targetRole(targetRole)
                .resumeFilename(resumeFilename)
                .jdText(request.getJdText())
                .matchScore(geminiResult.getMatchScore())
                .missingKeywords(geminiResult.getMissingKeywords())
                .skillGaps(geminiResult.getSkillGaps())
                .formatSuggestions(geminiResult.getFormatSuggestions())
                .improvementSuggestions(geminiResult.getImprovementSuggestions())
                .roleTrendingSkills(trendingSkills)
                .analyzedAt(Instant.now())
                .build();

        ResumeAnalysis saved = resumeAnalysisRepository.save(analysis);

        return mapToAnalysisResponse(saved);
    }

    public List<HistorySummaryDto> getUserHistory(String userId) {
        List<ResumeAnalysis> list = resumeAnalysisRepository.findByUserIdOrderByAnalyzedAtDesc(userId);
        return list.stream().map(a -> HistorySummaryDto.builder()
                .id(a.getId())
                .resumeId(a.getResumeId())
                .resumeFilename(a.getResumeFilename())
                .targetRole(a.getTargetRole())
                .matchScore(a.getMatchScore())
                .missingKeywordsCount(a.getMissingKeywords() != null ? a.getMissingKeywords().size() : 0)
                .skillGapsCount(a.getSkillGaps() != null ? a.getSkillGaps().size() : 0)
                .analyzedAt(a.getAnalyzedAt())
                .build()
        ).collect(Collectors.toList());
    }

    public AnalysisResponse getAnalysisById(String id, String userId) {
        ResumeAnalysis analysis = resumeAnalysisRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis record not found with id: " + id));
        return mapToAnalysisResponse(analysis);
    }

    private AnalysisResponse mapToAnalysisResponse(ResumeAnalysis analysis) {
        String jdPreview = analysis.getJdText() != null ?
                (analysis.getJdText().length() > 200 ? analysis.getJdText().substring(0, 200) + "..." : analysis.getJdText()) :
                "";

        return AnalysisResponse.builder()
                .id(analysis.getId())
                .resumeId(analysis.getResumeId())
                .resumeFilename(analysis.getResumeFilename())
                .targetRole(analysis.getTargetRole())
                .jdPreview(jdPreview)
                .matchScore(analysis.getMatchScore())
                .missingKeywords(analysis.getMissingKeywords())
                .skillGaps(analysis.getSkillGaps())
                .formatSuggestions(analysis.getFormatSuggestions())
                .improvementSuggestions(analysis.getImprovementSuggestions())
                .roleTrendingSkills(analysis.getRoleTrendingSkills())
                .analyzedAt(analysis.getAnalyzedAt())
                .build();
    }
}
