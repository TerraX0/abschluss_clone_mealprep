package org.backend.controller;

import org.backend.dto.EigenesRezeptErstellenDto;
import org.backend.dto.ExternesRezeptDto;
import org.backend.dto.GespeichertesRezeptDto;
import org.backend.enums.Kategorie;
import org.backend.service.RezeptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rezepte")
public class RezeptController {

    private final RezeptService rezeptService;

    public RezeptController(RezeptService rezeptService) {
        this.rezeptService = rezeptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GespeichertesRezeptDto speichereRezept(
            @RequestBody ExternesRezeptDto externesRezeptDto
    ) {
        return rezeptService.speichereExternesRezept(externesRezeptDto);
    }

    // US-08: Erweiterung von GET /api/rezepte um Such-, Kategorie- und Favoriten-Filter
    @GetMapping
    public List<GespeichertesRezeptDto> holeAlleRezepte(
            @RequestParam(required = false) String suche,
            @RequestParam(required = false) Kategorie kategorie,
            @RequestParam(defaultValue = "false") boolean nurFavoriten
    ) {
        if ((suche == null || suche.isBlank()) && kategorie == null && !nurFavoriten) {
            return rezeptService.holeAlleRezepte();
        }
        return rezeptService.filtereRezepte(suche, kategorie, nurFavoriten);
    }

    @PostMapping("/eigene")
    @ResponseStatus(HttpStatus.CREATED)
    public GespeichertesRezeptDto erstelleEigenesRezept(
            @Valid @RequestBody EigenesRezeptErstellenDto eigenesRezeptErstellenDto
    ) {
        return rezeptService.erstelleEigenesRezept(eigenesRezeptErstellenDto);
    }

    @PutMapping("/{id}")
    public GespeichertesRezeptDto bearbeiteEigenesRezept(
            @PathVariable Long id,
            @Valid @RequestBody EigenesRezeptErstellenDto dto
    ) {
        return rezeptService.bearbeiteEigenesRezept(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void loescheEigenesRezept(@PathVariable Long id) {
        rezeptService.loescheEigenesRezept(id);
    }

    // US-08: Endpunkt zum persistenten Umschalten des Favoritenstatus eines Rezepts
    @PatchMapping("/{id}/favorit")
    public GespeichertesRezeptDto schalteFavoritUm(@PathVariable Long id) {
        return rezeptService.schalteFavoritUm(id);
    }
}