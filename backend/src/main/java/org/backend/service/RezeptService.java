package org.backend.service;

import org.backend.dto.ExternesRezeptDto;
import org.backend.entity.Rezept;
import org.backend.repository.RezeptRepository;
import org.backend.dto.ZutatDto;
import org.backend.entity.RezeptZutat;

import org.springframework.stereotype.Service;

@Service
public class RezeptService {
    private final RezeptRepository rezeptRepository;

    public RezeptService(RezeptRepository rezeptRepository) {
        this.rezeptRepository = rezeptRepository;
    }

    public Rezept speicherRezept(Rezept rezept) {
      if(rezept.getExterneId() != null && rezeptRepository.existsByExterneId(rezept.getExterneId())) {

          throw new IllegalArgumentException("Dieses Rezept existiert bereits!");
      }
      return rezeptRepository.save(rezept);
    }

    public Rezept wandleDtoInRezeptUm(ExternesRezeptDto externesRezeptDto) {
        Rezept rezept = new Rezept(
                externesRezeptDto.id(),
                externesRezeptDto.name(),
                externesRezeptDto.kategorie(),
                externesRezeptDto.kueche(),
                externesRezeptDto.region(),
                externesRezeptDto.anweisungen(),
                externesRezeptDto.thumbnail()
        );

        for(ZutatDto zutatDto : externesRezeptDto.zutaten()){
            RezeptZutat rezeptZutat = new RezeptZutat(
                    zutatDto.name(),
                    zutatDto.menge()
            );
            rezept.fuegeZutatHinzu(rezeptZutat);
        }
        return rezept;
    }
}
