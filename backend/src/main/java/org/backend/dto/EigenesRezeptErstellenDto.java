package org.backend.dto;

import org.backend.enums.Kategorie;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record EigenesRezeptErstellenDto(
        @NotBlank String name,
        @NotNull Kategorie kategorie,
        @NotBlank String anweisungen,
        @NotEmpty List<@Valid ZutatDto> zutaten
) {
}
