package com.mayihelpyou.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResumeParserServiceTest {

    private ResumeParserService parserService;

    @BeforeEach
    void setUp() {
        parserService = new ResumeParserService();
    }

    @Test
    void testCleanExtractedText() {
        String raw = "John Doe \r\n\r\n\r\n Software Engineer \t\t Java, Spring Boot \n\n\n Experience";
        String cleaned = parserService.cleanExtractedText(raw);
        assertTrue(cleaned.contains("John Doe"));
        assertTrue(cleaned.contains("Software Engineer"));
        assertTrue(cleaned.contains("Java, Spring Boot"));
    }

    @Test
    void testExtractFromPdf() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                cs.newLineAtOffset(100, 700);
                cs.showText("Alice Developer - Java & React Specialist");
                cs.endText();
            }
            doc.save(baos);
        }

        String text = parserService.extractFromPdf(baos.toByteArray());
        assertTrue(text.contains("Alice Developer"));
        assertTrue(text.contains("Java & React Specialist"));
    }

    @Test
    void testExtractFromDocx() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            XWPFRun r = p.createRun();
            r.setText("Senior Cloud Architect with AWS and Kubernetes expertise");
            doc.write(baos);
        }

        String text = parserService.extractFromDocx(baos.toByteArray());
        assertTrue(text.contains("Senior Cloud Architect"));
        assertTrue(text.contains("Kubernetes"));
    }

    @Test
    void testExtractFromPptx() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (XMLSlideShow ppt = new XMLSlideShow()) {
            XSLFSlide slide = ppt.createSlide();
            XSLFTextBox textBox = slide.createTextBox();
            textBox.setText("Job Description: Senior Full Stack Engineer. Requires React and Python.");
            ppt.write(baos);
        }

        String text = parserService.extractFromPptx(baos.toByteArray());
        assertTrue(text.contains("Senior Full Stack Engineer"));
        assertTrue(text.contains("React and Python"));
    }

    @Test
    void testExtractFromTxt() {
        byte[] bytes = "Backend Engineer Job Description\nResponsibilities:\n- Build microservices in Java".getBytes();
        String text = parserService.extractFromTxt(bytes);
        assertTrue(text.contains("Backend Engineer"));
        assertTrue(text.contains("Build microservices"));
    }

    @Test
    void testGetFileExtension() {
        assertEquals("pdf", parserService.getFileExtension("my_resume.pdf"));
        assertEquals("docx", parserService.getFileExtension("resume.v2.docx"));
        assertEquals("pptx", parserService.getFileExtension("jd_deck.pptx"));
        assertEquals("ppt", parserService.getFileExtension("presentation.ppt"));
        assertEquals("", parserService.getFileExtension("noextension"));
    }
}
