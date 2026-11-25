package org.backend.service;

import jakarta.transaction.Transactional;
import org.backend.dto.ErnaehrungsplaneintragDto;
import org.backend.entity.Ernaehrungsplaneintrag;
import org.backend.repository.ErnaehrungsplaneintragRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ErnaehrungsplanService {
    private final ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository;

    public ErnaehrungsplanService(ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository) {
        this.ernaehrungsplaneintragRepository = ernaehrungsplaneintragRepository;
    }


    @Transactional
    public List<ErnaehrungsplaneintragDto> holeWochenplan(LocalDate startDatum, LocalDate endDatum) {
        return ernaehrungsplaneintragRepository.findByDatumBetween(startDatum, endDatum)
                .stream()
                .map(this::wandleInDtoUm)
                .toList();
    }

    private ErnaehrungsplaneintragDto wandleInDtoUm(Ernaehrungsplaneintrag eintrag ) {
        return new ErnaehrungsplaneintragDto(
                eintrag.getId(),
                eintrag.getDatum(),
                eintrag.getMahlzeit(),
                eintrag.getPortionen(),
                eintrag.getRezept().getId()
        );
    }
}
