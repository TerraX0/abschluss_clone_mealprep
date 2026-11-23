package org.backend.enums;

public enum Kategorie {
    RINDFLEISCH,
    FRUEHSTUECK,
    HAEHNCHEN,
    NACHSPEISE,
    ZIEGENFLEISCH,
    LAMMFLEISCH,
    SONSTIGES,
    PASTA,
    SCHWEINEFLEISCH,
    MEERESFRUECHTE,
    BEILAGE,
    VORSPEISE,
    VEGAN,
    VEGETARISCH;

    //übersetzung der gelieferten Werte
    public static Kategorie vonApiWert(String apiWert){
        return switch(apiWert){
            case "Beef" -> RINDFLEISCH;
            case "Breakfast" -> FRUEHSTUECK;
            case "Chicken" -> HAEHNCHEN;
            case "Dessert" -> NACHSPEISE;
            case "Goat" -> ZIEGENFLEISCH;
            case "Lamb" -> LAMMFLEISCH;
            case "Miscellaneous" -> SONSTIGES;
            case "Pasta" -> PASTA;
            case "Pork" -> SCHWEINEFLEISCH;
            case "Seafood" -> MEERESFRUECHTE;
            case "Side" -> BEILAGE;
            case "Starter" -> VORSPEISE;
            case "Vegan" -> VEGAN;
            case "Vegetarian" -> VEGETARISCH;
            default -> SONSTIGES;
        };
    }
}
