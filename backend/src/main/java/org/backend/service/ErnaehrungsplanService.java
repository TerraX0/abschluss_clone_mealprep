package org.backend.service;


import org.backend.dto.ErnaehrungsplaneintragDto;
import org.backend.entity.Ernaehrungsplaneintrag;
import org.backend.repository.ErnaehrungsplaneintragRepository;
import org.backend.repository.RezeptRepository;
import org.backend.dto.ErnaehrungsplaneintragErstellenDto;
import org.backend.entity.Rezept;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ErnaehrungsplanService {
    private final ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository;

    private final RezeptRepository rezeptRepository;

    public ErnaehrungsplanService(ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository, RezeptRepository rezeptRepository) {
        this.ernaehrungsplaneintragRepository = ernaehrungsplaneintragRepository;
        this.rezeptRepository = rezeptRepository;
    }


    @Transactional(readOnly = true)
    public List<ErnaehrungsplaneintragDto> holeWochenplan(LocalDate startDatum, LocalDate endDatum) {
        return ernaehrungsplaneintragRepository.findByDatumBetween(startDatum, endDatum)
                .stream()
                .map(this::wandleInDtoUm)
                .toList();
    }

    private ErnaehrungsplaneintragDto wandleInDtoUm(Ernaehrungsplaneintrag eintrag) {
        return new ErnaehrungsplaneintragDto(
                eintrag.getId(),
                eintrag.getDatum(),
                eintrag.getMahlzeit(),
                eintrag.getPortionen(),
                eintrag.getRezept().getId()
        );
    }

    @Transactional
    public ErnaehrungsplaneintragDto erstelleEintrag(
            ErnaehrungsplaneintragErstellenDto ernaehrungsplaneintragErstellenDto
    ) {
        Rezept rezept = rezeptRepository.findById(ernaehrungsplaneintragErstellenDto.rezeptId())
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Rezept nicht gefunden!"
                        )
                );
        Ernaehrungsplaneintrag eintrag = new Ernaehrungsplaneintrag(
                ernaehrungsplaneintragErstellenDto.datum(),
                ernaehrungsplaneintragErstellenDto.mahlzeit(),
                ernaehrungsplaneintragErstellenDto.portionen(),
                rezept
        );
        Ernaehrungsplaneintrag gespeicherterEintrag = ernaehrungsplaneintragRepository.save(eintrag);

        return wandleInDtoUm(gespeicherterEintrag);
    }

    @Transactional
    public void loescheEintrag(Long id){
        if(!ernaehrungsplaneintragRepository.existsById(id)){
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Eintrag nicht gefunden!");
        }

        ernaehrungsplaneintragRepository.deleteById(id);
    }

    @Transactional
    public ErnaehrungsplaneintragDto bearbeiteEintrag(
            Long id,
            ErnaehrungsplaneintragErstellenDto ernaehrungsplaneintragErstellenDto
    ){
        Ernaehrungsplaneintrag eintrag = ernaehrungsplaneintragRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Eintrag nicht gefunden!"
                        )
                );

        Rezept rezept = rezeptRepository.findById(ernaehrungsplaneintragErstellenDto.rezeptId())
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Rezept nicht gefunden!"
                        )
                );

                eintrag.aktualisieren(
                        ernaehrungsplaneintragErstellenDto.datum(),
                        ernaehrungsplaneintragErstellenDto.mahlzeit(),
                        ernaehrungsplaneintragErstellenDto.portionen(),
                        rezept
                );
                return wandleInDtoUm(eintrag);
    }
}
