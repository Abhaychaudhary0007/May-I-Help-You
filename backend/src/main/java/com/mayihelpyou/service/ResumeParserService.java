package com.mayihelpyou.service;

import com.mayihelpyou.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.extractor.ExtractorFactory;
import org.apache.poi.extractor.POITextExtractor;
import org.apache.poi.hslf.usermodel.HSLFSlideShow;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class ResumeParserService {

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Uploaded file is empty or missing");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new InvalidFileException("Filename is missing");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        try {
            byte[] bytes = file.getBytes();
            return switch (extension) {
                case "pdf" -> extractFromPdf(bytes);
                case "docx" -> extractFromDocx(bytes);
                case "doc" -> extractFromDoc(bytes);
                case "pptx" -> extractFromPptx(bytes);
                case "ppt" -> extractFromPpt(bytes);
                case "txt", "text", "md", "rtf" -> extractFromTxt(bytes);
                default -> extractWithGenericExtractor(bytes, extension);
            };
        } catch (IOException ex) {
            log.error("Failed to read file bytes: {}", ex.getMessage());
            throw new InvalidFileException("Could not read uploaded file: " + ex.getMessage());
        }
    }

    public String extractFromPdf(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            if (document.isEncrypted()) {
                throw new InvalidFileException("Cannot extract text from password-protected PDF file");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            return cleanExtractedText(text);
        } catch (IOException ex) {
            log.error("PDFBox extraction failed: {}", ex.getMessage());
            throw new InvalidFileException("Failed to parse PDF document: " + ex.getMessage());
        }
    }

    public String extractFromDocx(byte[] docxBytes) {
        try (InputStream is = new ByteArrayInputStream(docxBytes);
             XWPFDocument document = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            return cleanExtractedText(text);
        } catch (IOException ex) {
            log.error("Apache POI DOCX extraction failed: {}", ex.getMessage());
            throw new InvalidFileException("Failed to parse DOCX document: " + ex.getMessage());
        }
    }

    public String extractFromDoc(byte[] docBytes) {
        try (InputStream is = new ByteArrayInputStream(docBytes);
             HWPFDocument document = new HWPFDocument(is);
             WordExtractor extractor = new WordExtractor(document)) {
            String text = extractor.getText();
            return cleanExtractedText(text);
        } catch (Exception ex) {
            log.error("Apache POI DOC extraction failed: {}", ex.getMessage());
            throw new InvalidFileException("Failed to parse DOC document: " + ex.getMessage());
        }
    }

    public String extractFromPptx(byte[] pptxBytes) {
        try (InputStream is = new ByteArrayInputStream(pptxBytes);
             XMLSlideShow ppt = new XMLSlideShow(is)) {
            StringBuilder sb = new StringBuilder();
            for (XSLFSlide slide : ppt.getSlides()) {
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        sb.append(textShape.getText()).append("\n");
                    }
                }
            }
            return cleanExtractedText(sb.toString());
        } catch (Exception ex) {
            log.error("Apache POI PPTX extraction failed: {}", ex.getMessage());
            throw new InvalidFileException("Failed to parse PPTX presentation: " + ex.getMessage());
        }
    }

    public String extractFromPpt(byte[] pptBytes) {
        try (InputStream is = new ByteArrayInputStream(pptBytes);
             POITextExtractor extractor = ExtractorFactory.createExtractor(is)) {
            String text = extractor.getText();
            return cleanExtractedText(text);
        } catch (Exception ex) {
            log.error("Apache POI PPT extraction failed: {}", ex.getMessage());
            throw new InvalidFileException("Failed to parse PPT presentation: " + ex.getMessage());
        }
    }

    public String extractWithGenericExtractor(byte[] bytes, String extension) {
        try (InputStream is = new ByteArrayInputStream(bytes);
             POITextExtractor extractor = ExtractorFactory.createExtractor(is)) {
            String text = extractor.getText();
            return cleanExtractedText(text);
        } catch (Exception ex) {
            log.warn("Generic POI extractor failed for .{}, attempting raw text decode: {}", extension, ex.getMessage());
            return cleanExtractedText(new String(bytes, StandardCharsets.UTF_8));
        }
    }

    public String extractFromTxt(byte[] txtBytes) {
        return cleanExtractedText(new String(txtBytes, StandardCharsets.UTF_8));
    }

    public String cleanExtractedText(String text) {
        if (text == null) {
            return "";
        }
        String cleaned = text.replaceAll("\\r\\n", "\n")
                .replaceAll("\\r", "\n")
                .replaceAll("[\\t ]+", " ")
                .replaceAll("\n{3,}", "\n\n")
                .trim();

        if (cleaned.isEmpty()) {
            throw new InvalidFileException("Could not extract any readable text from document. Ensure it is not an empty or image-only file.");
        }
        return cleaned;
    }

    public String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }
}
