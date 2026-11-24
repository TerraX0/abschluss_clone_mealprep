package org.backend.repository;
import org.backend.entity.Rezept;
import org.backend.enums.Kategorie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RezeptRepository extends JpaRepository<Rezept, Long> {
    boolean existsByExterneId(String externeId);
}
