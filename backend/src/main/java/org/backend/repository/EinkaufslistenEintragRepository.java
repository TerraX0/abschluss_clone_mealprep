package org.backend.repository;

import org.backend.entity.EinkaufslistenEintrag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EinkaufslistenEintragRepository extends JpaRepository<EinkaufslistenEintrag, Long> {

    // US-07: Einträge sortiert laden (z. B. offene zuerst, dann nach ID)
    List<EinkaufslistenEintrag> findAllByOrderByErledigtAscIdAsc();

    // US-07: Prüfen/anzeigen, wie viele erledigte Einträge aktuell vorhanden sind
    long countByErledigtTrue();

    // US-07: Alle abgehakten/erledigten Artikel aus der Datenbank löschen
    void deleteByErledigtTrue();
}