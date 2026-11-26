package org.backend.service;

import org.backend.dto.VorratArtikelDto;
import org.backend.dto.VorratArtikelRequestDto;
import org.backend.entity.VorratArtikel;
import org.backend.repository.VorratRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class VorratService {

    private final VorratRepository vorratRepository;

    public VorratService(VorratRepository vorratRepository) {
        this.vorratRepository = vorratRepository;
    }

    @Transactional(readOnly = true)
    public List<VorratArtikelDto> holeAlleVorratsartikel() {
        return vorratRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public VorratArtikelDto erstelleVorratsartikel(VorratArtikelRequestDto dto) {
        VorratArtikel artikel = new VorratArtikel(
                dto.name().trim(),
                dto.menge() != null ? dto.menge().trim() : ""
        );
        return toDto(vorratRepository.save(artikel));
    }

    @Transactional
    public VorratArtikelDto aktualisiereVorratsartikel(Long id, VorratArtikelRequestDto dto) {
        VorratArtikel artikel = vorratRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Vorratsartikel nicht gefunden!"
                ));

        artikel.aktualisiere(
                dto.name().trim(),
                dto.menge() != null ? dto.menge().trim() : ""
        );
        return toDto(artikel);
    }

    @Transactional
    public void loescheVorratsartikel(Long id) {
        VorratArtikel artikel = vorratRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Vorratsartikel nicht gefunden!"
                ));
        vorratRepository.delete(artikel);
    }

    // Für US-09: Vorhandene im Vorrat Zutaten bei EInkaufsmenge berücksichtigen.
    @Transactional(readOnly = true)
    public Map<String, String> holeVorratMengenLowercase() {
        Map<String, String> result = new LinkedHashMap<>();
        for (VorratArtikel artikel : vorratRepository.findAll()) {
            if (artikel.getName() != null && !artikel.getName().isBlank()) {
                // Locale.ROOT: Sprach- und Systemunabhängige Basis-Locale (Spracheinstellungen).
                String key = artikel.getName().trim().toLowerCase(Locale.ROOT);
                String menge = artikel.getMenge() != null ? artikel.getMenge().trim() : "";
                result.putIfAbsent(key, menge);
            }
        }
        return result;
    }
    private VorratArtikelDto toDto(VorratArtikel artikel) {
        return new VorratArtikelDto(artikel.getId(), artikel.getName(), artikel.getMenge());
    }


}