package org.backend.mapper;

import org.backend.dto.ExternesRezeptDto;
import org.backend.dto.ZutatDto;
import org.backend.enums.Kategorie;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import org.backend.entity.Rezept;
import org.backend.entity.RezeptZutat;
import org.backend.dto.GespeichertesRezeptDto;

import java.util.ArrayList;
import java.util.List;

@Component
public class RezeptMapper {

    //mappen die zutaten mit den Mengenangaben
    private List<ZutatDto> leseZutaten(JsonNode gericht) {
        List<ZutatDto> zutatenListe = new ArrayList<>();

        for (int i = 1; i <= 20; i++) {
            String zutatenFeld = "strIngredient" + i;
            String mengenFeld = "strMeasure" + i;

            String zutat = gericht.path(zutatenFeld).asString("");
            String menge = gericht.path(mengenFeld).asString("");

            if (!zutat.isBlank()) {
                zutatenListe.add(new ZutatDto(zutat, menge));
            }

        }
        return zutatenListe;
    }

    public ExternesRezeptDto wandleGerichtUm(JsonNode gericht) {
        String id = gericht.path("idMeal").asString("");
        String name = gericht.path("strMeal").asString("");
        String kueche = gericht.path("strArea").asString("");
        String region = gericht.path("strCountry").asString("");
        String anweisungen = gericht.path("strInstructions").asString("");
        String thumbnail = gericht.path("strMealThumb").asString("");
        Kategorie kategorie = Kategorie.vonApiWert(gericht.path("strCategory").asString(""));

        List<ZutatDto> zutaten = leseZutaten(gericht);

        return new ExternesRezeptDto(
                id,
                name,
                kategorie,
                kueche,
                region,
                anweisungen,
                thumbnail,
                zutaten,
                false
        );
    }

    public List<ExternesRezeptDto> wandleSuchergebnisseUm(JsonNode suchergebnisse) {

        List<ExternesRezeptDto> rezepte = new ArrayList<>();
        JsonNode gerichte = suchergebnisse.path("meals");

        if (gerichte.isArray()) {
            for (JsonNode gericht : gerichte) {

                ExternesRezeptDto rezept = wandleGerichtUm(gericht);

                rezepte.add(rezept);
            }
        }
        return rezepte;
    }

    public List<ExternesRezeptDto> wandleKategorieErgebnisseUm(
            JsonNode gewaehlteKategorie,
            Kategorie kategorie
    ) {
        List<ExternesRezeptDto> rezepte = new ArrayList<>();

        JsonNode gerichte = gewaehlteKategorie.path("meals");

        if (gerichte.isArray()) {
            for (JsonNode gericht : gerichte) {

                String id = gericht.path("idMeal").asString("");
                String name = gericht.path("strMeal").asString("");
                String thumbnail = gericht.path("strMealThumb").asString("");

                ExternesRezeptDto rezept = new ExternesRezeptDto(
                        id,
                        name,
                        kategorie,
                        "",
                        "",
                        "",
                        thumbnail,
                        List.of(),
                        false
                );

                rezepte.add(rezept);
            }
        }

        return rezepte;
    }

    public GespeichertesRezeptDto wandleEntityInDtoUm(Rezept rezept) {
        List<ZutatDto> zutaten = new ArrayList<>();

        for (RezeptZutat rezeptZutat : rezept.getZutaten()) {
            zutaten.add(new ZutatDto(
                    rezeptZutat.getName(),
                    rezeptZutat.getMenge()
            ));
        }

        return new GespeichertesRezeptDto(
                rezept.getId(),
                rezept.getExterneId(),
                rezept.getName(),
                rezept.getKategorie(),
                rezept.getKueche(),
                rezept.getRegion(),
                rezept.getAnweisungen(),
                rezept.getThumbnail(),
                zutaten
        );
    }
}