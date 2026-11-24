package org.backend.controller;

import org.backend.service.ExterneRezepteService;
import org.backend.dto.ExternesRezeptDto;
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

    @GetMapping("/{id}")
    public ResponseEntity<ExternesRezeptDto> holeEinzelnesExternesRezept(@PathVariable String id) {
        return ResponseEntity.status(HttpStatus.OK).body(externeRezepteService.holeEinzelnesExternesRezept(id));
    }
}
