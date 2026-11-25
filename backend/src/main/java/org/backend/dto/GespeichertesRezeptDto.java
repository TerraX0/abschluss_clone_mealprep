package org.backend.dto;

import org.backend.enums.Kategorie;
import java.util.List;

public record GespeichertesRezeptDto(
        Long id,
        String externeId,
        String name,
        Kategorie kategorie,
        String kueche,
        String region,
        String anweisungen,
        String thumbnail,
        List<ZutatDto> zutaten,
        // Für US-8
        boolean istFavorit
) {
}
