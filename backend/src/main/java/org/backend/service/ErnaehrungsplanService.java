package org.backend.service;

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


    public List<Ernaehrungsplaneintrag> holeWochenplan(LocalDate startDatum, LocalDate endDatum) {
        return ernaehrungsplaneintragRepository.findByDatumBetween(startDatum, endDatum);
    }
}
