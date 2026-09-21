package com.mayihelpyou.controller;

import com.mayihelpyou.dto.ApiResponse;
import com.mayihelpyou.dto.DocumentParseResponse;
import com.mayihelpyou.service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@RestController
@RequestMapping("/api/jd")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final ResumeParserService documentParserService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentParseResponse>> uploadJdFile(
            @RequestParam("file") MultipartFile file) {

        String extractedText = documentParserService.extractText(file);
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "job_description";
        String fileType = documentParserService.getFileExtension(originalFilename);

        String preview = extractedText.length() > 300 ?
                extractedText.substring(0, 300) + "..." :
                extractedText;

        DocumentParseResponse response = DocumentParseResponse.builder()
                .filename(originalFilename)
                .fileType(fileType)
                .fileSize(file.getSize())
                .characterCount(extractedText.length())
                .extractedText(extractedText)
                .previewText(preview)
                .parsedAt(Instant.now())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Job description file parsed successfully", response));
    }
}
