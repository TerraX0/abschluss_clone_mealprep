package org.backend.controller;

import jakarta.validation.Valid;
import org.backend.dto.VorratArtikelDto;
import org.backend.dto.VorratArtikelRequestDto;
import org.backend.service.VorratService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vorrat")
public class VorratController {

    private final VorratService vorratService;

    public VorratController(VorratService vorratService) {
        this.vorratService = vorratService;
    }

    @GetMapping
    public List<VorratArtikelDto> holeAlle() {
        return vorratService.holeAlleVorratsartikel();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VorratArtikelDto anlegen(@Valid @RequestBody VorratArtikelRequestDto dto) {
        return vorratService.erstelleVorratsartikel(dto);
    }

    @PutMapping("/{id}")
    public VorratArtikelDto bearbeiten(
            @PathVariable Long id,
            @Valid @RequestBody VorratArtikelRequestDto dto
    ) {
        return vorratService.aktualisiereVorratsartikel(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void loeschen(@PathVariable Long id) {
        vorratService.loescheVorratsartikel(id);
    }
}