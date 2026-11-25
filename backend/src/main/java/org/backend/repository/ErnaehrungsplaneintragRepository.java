package org.backend.repository;

import org.backend.entity.Ernaehrungsplaneintrag;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ErnaehrungsplaneintragRepository extends JpaRepository<Ernaehrungsplaneintrag, Long> {
    List<Ernaehrungsplaneintrag> findByDatumBetween(LocalDate startDatum, LocalDate endDatum);
}
