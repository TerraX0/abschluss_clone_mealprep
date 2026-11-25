
package org.backend.controller;

import org.backend.service.RezeptService;
import org.backend.dto.ExternesRezeptDto;
import org.backend.dto.GespeichertesRezeptDto;
import org.backend.dto.EigenesRezeptErstellenDto;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

    @GetMapping
    public List<GespeichertesRezeptDto> holeAlleRezepte() {
        return rezeptService.holeAlleRezepte();
    }

    @PostMapping("/eigene")
    @ResponseStatus(HttpStatus.CREATED)
    public GespeichertesRezeptDto erstelleEigenesRezept(@Valid @RequestBody EigenesRezeptErstellenDto eigenesRezeptErstellenDto) {
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
}
