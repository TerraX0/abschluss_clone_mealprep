package org.backend.dto;

import org.backend.enums.Kategorie;

import java.util.List;

public record ExternesRezeptDto(String id,
                                String name,
                                Kategorie kategorie,
                                String kueche,
                                String region,
                                String anweisungen,
                                String thumbnail,
                                List<ZutatDto> zutaten,
                                boolean istFavorit) {
}
