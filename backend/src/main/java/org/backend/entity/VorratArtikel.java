package org.backend.entity;
// Für US-09
import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class VorratArtikel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String menge;

    protected VorratArtikel() {
    }

    public VorratArtikel(String name, String menge) {
        this.name = name;
        this.menge = menge;
    }

    public void aktualisiere(String name, String menge) {
        this.name = name;
        this.menge = menge;
    }
}