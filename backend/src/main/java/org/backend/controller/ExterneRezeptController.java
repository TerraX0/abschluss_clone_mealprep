package org.backend.controller;

import org.backend.service.ExterneRezepteService;
import org.backend.dto.ExternesRezeptDto;
import org.backend.enums.Kategorie;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mealprep")
public class ExterneRezeptController {
    private final ExterneRezepteService externeRezepteService;

    public ExterneRezeptController(ExterneRezepteService externeRezepteService) {
        this.externeRezepteService = externeRezepteService;
    }


    @GetMapping("/search")
    public List<ExternesRezeptDto> sucheRezepte(
            @RequestParam("suche") String suchbegriff
    ) {
        return externeRezepteService.sucheRezepte(suchbegriff);
    }

    @GetMapping("/kategorie")
    public List<ExternesRezeptDto> filterNachKategorie(
            @RequestParam("kategorie") Kategorie kategorie
    ){
        return externeRezepteService.sucheNachKategorie(kategorie);
    }

    @GetMapping("/kategorien")
    public Kategorie[] gibKategorienZurueck() {
        return Kategorie.values();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternesRezeptDto> holeEinzelnesExternesRezept(@PathVariable String id) {
        return ResponseEntity.status(HttpStatus.OK).body(externeRezepteService.holeEinzelnesExternesRezept(id));
    }
}
