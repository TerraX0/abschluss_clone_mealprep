package org.backend.entity;

import jakarta.persistence.*;


import java.util.List;
import java.util.ArrayList;

import lombok.Getter;
import org.backend.dto.ZutatDto;
import org.backend.enums.Kategorie;

@Entity
@Getter
public class Rezept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String externeId;
    private String name;

    @Enumerated(EnumType.STRING)
    private Kategorie kategorie;

    private String kueche;
    private String region;

    @Column(columnDefinition = "TEXT")
    private String anweisungen;

    private String thumbnail;

    @OneToMany(mappedBy = "rezept", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RezeptZutat> zutaten = new ArrayList<>();
    protected Rezept() {
    }

    public Rezept(
            String externeId,
            String name,
            Kategorie kategorie,
            String kueche,
            String region,
            String anweisungen,
            String thumbnail
    ) {
        this.externeId = externeId;
        this.name = name;
        this.kategorie = kategorie;
        this.kueche = kueche;
        this.region = region;
        this.anweisungen = anweisungen;
        this.thumbnail = thumbnail;
    }




    public void fuegeZutatHinzu(RezeptZutat rezeptZutat) {
        zutaten.add(rezeptZutat);
        rezeptZutat.setRezept(this);
    }

    public void aktualisiere(
            String name,
            Kategorie kategorie,
            String anweisungen,
            List<ZutatDto> neueZutaten
    ) {
        this.name = name;
        this.kategorie = kategorie;
        this.anweisungen = anweisungen;

        for (RezeptZutat zutat : zutaten) {
            zutat.setRezept(null);
        }

        zutaten.clear();

        for (ZutatDto zutatDto : neueZutaten) {
            fuegeZutatHinzu(new RezeptZutat(
                    zutatDto.name(),
                    zutatDto.menge()
            ));
        }
    }


}
