package org.backend.repository;
import org.backend.entity.Rezept;
import org.backend.enums.Kategorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RezeptRepository extends JpaRepository<Rezept, Long> {
    boolean existsByExterneId(String externeId);

    // Für US-8
    List<Rezept> findByNameContainingIgnoreCase(String name);

    List<Rezept> findByKategorie(Kategorie kategorie);

    List<Rezept> findAllByIstFavoritTrue();
}
