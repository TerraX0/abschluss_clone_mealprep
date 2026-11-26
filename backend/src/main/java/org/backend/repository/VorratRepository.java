package org.backend.repository;

import org.backend.entity.VorratArtikel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VorratRepository extends JpaRepository<VorratArtikel, Long> {
    List<VorratArtikel> findAllByOrderByNameAsc();
}