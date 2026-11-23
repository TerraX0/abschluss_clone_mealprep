package org.backend;

import lombok.Data;

import java.util.List;

@Data
public class MealDbResponse {
    private List<MealDbMeal> meals;
}
