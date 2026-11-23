package org.backend;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Kategorie {
    BEEF("Beef"),
    CHICKEN("Chicken"),
    DESSERT("Dessert"),
    LAMB("Lamb"),
    MISCELLANEOUS("Miscellaneous"),
    PASTA("Pasta"),
    PORK("Pork"),
    SEAFOOD("Seafood"),
    SIDE("Side"),
    STARTER("Starter"),
    VEGAN("Vegan"),
    VEGETARIAN("Vegetarian"),
    BREAKFAST("Breakfast"),
    GOAT("Goat");

    private final String label;

    Kategorie(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    public static Kategorie fromLabel(String label) {
        for (Kategorie kategorie : values()) {
            if (kategorie.label.equalsIgnoreCase(label)) {
                return kategorie;
            }
        }
        throw new IllegalArgumentException("Unbekannte Kategorie: " + label);
    }
}
