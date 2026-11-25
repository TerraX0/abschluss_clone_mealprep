package org.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class EinkaufslistenEintrag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String menge;

    private int anzahlVerwendungen = 1;

    @Column(nullable = false)
    private boolean erledigt = false;

    protected EinkaufslistenEintrag() {
    }

    public EinkaufslistenEintrag(String name, String menge, int anzahlVerwendungen, boolean erledigt) {
        this.name = name;
        this.menge = menge;
        this.anzahlVerwendungen = anzahlVerwendungen;
        this.erledigt = erledigt;
    }
}