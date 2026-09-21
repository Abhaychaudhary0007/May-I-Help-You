package com.mayihelpyou.repository;

import com.mayihelpyou.model.ResumeAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends MongoRepository<ResumeAnalysis, String> {
    List<ResumeAnalysis> findByUserIdOrderByAnalyzedAtDesc(String userId);
    Optional<ResumeAnalysis> findByIdAndUserId(String id, String userId);
}
