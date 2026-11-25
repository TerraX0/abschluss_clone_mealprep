package org.backend.entity;

import jakarta.persistence.*;

import lombok.Getter;

import org.backend.enums.MahlzeitTyp;

import java.time.LocalDate;

@Entity
@Getter
public class Ernaehrungsplaneintrag {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    private LocalDate datum;

    @Enumerated(EnumType.STRING)
    private MahlzeitTyp mahlzeit;

    private int portionen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "rezept_id")
    private Rezept rezept;


    protected Ernaehrungsplaneintrag() {
    }

    public Ernaehrungsplaneintrag(LocalDate datum, MahlzeitTyp mahlzeit, int portionen, Rezept rezept) {
        this.datum = datum;
        this.mahlzeit = mahlzeit;
        this.portionen = portionen;
        this.rezept = rezept;
    }
}
