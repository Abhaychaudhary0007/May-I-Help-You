package com.mayihelpyou.repository;

import com.mayihelpyou.model.RoleTrend;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleTrendRepository extends MongoRepository<RoleTrend, String> {
    Optional<RoleTrend> findByRoleNameIgnoreCase(String roleName);
}
