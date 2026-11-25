package org.backend.dto;

public record EinkaufslistenEintragDto(
        Long id,
        String name,
        String menge,
        int anzahlVerwendungen,
        boolean erledigt
) {
}
