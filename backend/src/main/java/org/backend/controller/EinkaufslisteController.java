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

    public record NeuerArtikelRequest(String name, String menge) {}

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

    // US-07: Freie Artikel (z. B. Haushaltsrolle, Kaffee) manuell zur Einkaufsliste hinzufügen
    @PostMapping("/artikel")
    @ResponseStatus(HttpStatus.CREATED)
    public EinkaufslistenEintragDto artikelHinzufuegen(@RequestBody NeuerArtikelRequest request) {
        return einkaufslisteService.fuegeFreienArtikelHinzu(request.name(), request.menge());
    }

    // US-07: Status (offen / erledigt) eines Eintrags umschalten und sofort im Backend speichern
    @PatchMapping("/{id}/erledigt")
    public EinkaufslistenEintragDto erledigtUmschalten(@PathVariable Long id) {
        return einkaufslisteService.schalteErledigtUm(id);
    }

    // US-07: Alle abgehakten/erledigten Artikel aus der Einkaufsliste löschen
    @DeleteMapping("/erledigt")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void erledigteLoeschen() {
        einkaufslisteService.loescheErledigteEintraege();
    }
}