package org.backend.controller;

import org.backend.service.ExterneRezepteService;
import org.backend.dto.ExternesRezeptDto;
import org.backend.enums.Kategorie;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
}
