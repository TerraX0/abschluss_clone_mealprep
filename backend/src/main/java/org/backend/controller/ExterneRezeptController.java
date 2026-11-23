package org.backend.controller;

import org.backend.service.ExterneRezeptService;
import org.backend.dto.ExternesRezeptDto;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/mealprep")
public class ExterneRezeptController {
    private final ExterneRezeptService externeRezeptService;

    public ExterneRezeptController(ExterneRezeptService externeRezeptService) {
        this.externeRezeptService = externeRezeptService;
    }


    @GetMapping("/search")
    public List<ExternesRezeptDto> sucheRezepte(
            @RequestParam("suche") String suchbegriff
    ) {
        return externeRezeptService.sucheRezepte(suchbegriff);
    }
}
