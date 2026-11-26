package org.backend.service;

import org.backend.dto.ExternesRezeptDto;
import org.backend.dto.ZutatDto;
import org.backend.enums.Kategorie;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ZufallsRezeptService {

    private static final String RANDOM_URL =
            "https://www.themealdb.com/api/json/v1/1/random.php";

    private final RestClient restClient;

    public ZufallsRezeptService() {
        this.restClient = RestClient.create();
    }

    public ExternesRezeptDto holeZufallsRezept() {
        MealDbResponse response;
        try {
            response = restClient.get()
                    .uri(RANDOM_URL)
                    .retrieve()
                    .body(MealDbResponse.class);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "TheMealDB ist derzeit nicht erreichbar.",
                    ex
            );
        }

        if (response == null || response.meals() == null || response.meals().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Kein Zufallsrezept von TheMealDB erhalten."
            );
        }

        //return mappeAufDto(response.meals().getFirst());
        Object erstesElement = response.meals().getFirst();
        if (!(erstesElement instanceof Map<?, ?> meal)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unerwartetes Datenformat von TheMealDB erhalten."
            );
        }
        return mappeAufDto(meal);
    }


    //private ExternesRezeptDto mappeAufDto(Map<String, Object> meal) {
    private ExternesRezeptDto mappeAufDto(Map<?, ?> meal) {
        List<ZutatDto> zutaten = new ArrayList<>();

        for (int i = 1; i <= 20; i++) {
            String name = alsGetrimmterString(meal.get("strIngredient" + i));
            String menge = alsGetrimmterString(meal.get("strMeasure" + i));

            if (name != null && !name.isEmpty()) {
                // ZutatDto erwartet @NotBlank bei menge -> bei leerer Angabe sinnvoller Fallback
                String saubereMenge = (menge != null && !menge.isBlank()) ? menge : "nach Bedarf";
                zutaten.add(new ZutatDto(name, saubereMenge));
            }
        }

        String rohKategorie = alsGetrimmterString(meal.get("strCategory"));
        Kategorie kategorie = parseKategorie(rohKategorie);
        String region = alsGetrimmterString(meal.get("strArea"));
        if (region == null) {
            region = alsGetrimmterString(meal.get("strCountry"));
        }

        return new ExternesRezeptDto(
                alsGetrimmterString(meal.get("idMeal")),
                alsGetrimmterString(meal.get("strMeal")),
                kategorie,
                rohKategorie,
                region,
                alsGetrimmterString(meal.get("strInstructions")),
                alsGetrimmterString(meal.get("strMealThumb")),
                zutaten,
                false
        );
    }

    private static Kategorie parseKategorie(String rohKategorie) {
        if (rohKategorie == null || rohKategorie.isBlank()) {
            return Kategorie.values()[0];
        }

        String normalisiert = rohKategorie.trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_");

        for (Kategorie k : Kategorie.values()) {
            if (k.name().equalsIgnoreCase(normalisiert)) {
                return k;
            }
        }

        // Falls ein Wert wie "SONSTIGES" / "DESSERT" / "VEGETARISCH" existiert, ggf. hier gezielt zuordnen;
        // sonst sicherer Fallback auf den ersten Enum-Wert statt Absturz
        return Kategorie.values()[0];
    }

    private static String alsGetrimmterString(Object wert) {
        if (wert == null) {
            return null;
        }
        String getrimmt = wert.toString().trim();
        return getrimmt.isEmpty() ? null : getrimmt;
    }

    private record MealDbResponse(List<?> meals) {}
}
