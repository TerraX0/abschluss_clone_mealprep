package org.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record VorratArtikelRequestDto(
        @NotBlank String name,
        String menge
) {
}