package org.backend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rezept {
    private String id;
    private String name;
    private Kategorie kategorie;
    private String kueche;
    private String region;
    private String anweisungen;
    private String thumbnail;
    private List<Zutat> zutaten;
    private boolean istFavorit;
}
