package org.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
public class RezeptZutat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String menge;

    @JsonIgnore
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
