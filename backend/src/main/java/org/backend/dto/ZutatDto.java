package org.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ZutatDto(
        @NotBlank String name,
        @NotBlank String menge
)
{

}