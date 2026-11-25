package org.backend.dto;

import org.backend.enums.MahlzeitTyp;

import java.time.LocalDate;

public record ErnaehrungsplaneintragDto(Long id, LocalDate datum, MahlzeitTyp mahlzeit , int portionen, Long rezeptId) {
}
