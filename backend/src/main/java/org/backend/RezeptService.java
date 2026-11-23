package org.backend;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class RezeptService {

    private static final int MAX_ZUTATEN = 20;

    private final RestClient restClient;

    public RezeptService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://www.themealdb.com/api/json/v1/1")
                .build();
    }

    public Rezept getRezeptById(String id) {
        MealDbResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/lookup.php")
                        .queryParam("i", id)
                        .build())
                .retrieve()
                .body(MealDbResponse.class);

        if (response == null || response.getMeals() == null || response.getMeals().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kein Rezept mit ID " + id + " gefunden");
        }

        return toRezept(response.getMeals().get(0));
    }

    private Rezept toRezept(MealDbMeal meal) {
        return new Rezept(
                meal.getIdMeal(),
                meal.getStrMeal(),
                Kategorie.fromLabel(meal.getStrCategory()),
                meal.getStrArea(),
                meal.getStrCountry(),
                meal.getStrInstructions(),
                meal.getStrMealThumb(),
                toZutaten(meal),
                false
        );
    }

    private List<Zutat> toZutaten(MealDbMeal meal) {
        List<Zutat> zutaten = new ArrayList<>();

        for (int i = 1; i <= MAX_ZUTATEN; i++) {
            String name = meal.getWeitereFelder().get("strIngredient" + i);
            if (name == null || name.isBlank()) {
                continue;
            }

            String menge = meal.getWeitereFelder().get("strMeasure" + i);
            zutaten.add(new Zutat(name.trim(), menge == null ? "" : menge.trim()));
        }

        return zutaten;
    }
}
