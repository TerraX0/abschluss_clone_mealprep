package org.backend.entity;

import jakarta.persistence.*;
import lombok.Setter;

@Entity
public class RezeptZutat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String menge;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rezept_id")
    private Rezept rezept;

    protected RezeptZutat() {
    }

    public RezeptZutat(String name, String menge) {
        this.name = name;
        this.menge = menge;
    }
}
