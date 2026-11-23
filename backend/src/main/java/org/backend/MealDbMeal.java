package org.backend;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class MealDbMeal {
    private String idMeal;
    private String strMeal;
    private String strCategory;
    private String strArea;
    private String strCountry;
    private String strInstructions;
    private String strMealThumb;

    // Alle übrigen Felder (strIngredient1..20, strMeasure1..20, strTags, ...)
    @JsonAnySetter
    private Map<String, String> weitereFelder = new HashMap<>();
}