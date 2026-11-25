package org.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.backend.enums.MahlzeitTyp;

import java.time.LocalDate;

public record ErnaehrungsplaneintragErstellenDto(
        @NotNull LocalDate datum,
        @NotNull MahlzeitTyp mahlzeit,
        @NotNull @Min(1) Integer portionen,
        @NotNull Long rezeptId
) {
}
