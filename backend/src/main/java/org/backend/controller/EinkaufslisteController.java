package org.backend.controller;

import org.backend.dto.EinkaufslistenEintragDto;
import org.backend.service.EinkaufslisteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/einkaufsliste")
public class EinkaufslisteController {

    private final EinkaufslisteService einkaufslisteService;

    public EinkaufslisteController(EinkaufslisteService einkaufslisteService) {
        this.einkaufslisteService = einkaufslisteService;
    }

    @GetMapping
    public List<EinkaufslistenEintragDto> holeEinkaufsliste() {
        return einkaufslisteService.holeEinkaufsliste();
    }

    @PostMapping("/generieren")
    @ResponseStatus(HttpStatus.CREATED)
    public List<EinkaufslistenEintragDto> generiereAusWochenplan(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDatum,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDatum
    ) {
        return einkaufslisteService.generiereAusWochenplan(startDatum, endDatum);
    }
}