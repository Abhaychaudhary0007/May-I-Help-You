package com.mayihelpyou.repository;

import com.mayihelpyou.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByUserIdOrderByUploadedAtDesc(String userId);
    Optional<Resume> findByIdAndUserId(String id, String userId);
}
