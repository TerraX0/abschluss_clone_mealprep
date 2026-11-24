
package org.backend.service;

import org.backend.dto.ExternesRezeptDto;
import org.backend.dto.GespeichertesRezeptDto;
import org.backend.dto.ZutatDto;
import org.backend.entity.Rezept;
import org.backend.entity.RezeptZutat;
import org.backend.mapper.RezeptMapper;
import org.backend.repository.RezeptRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RezeptService {

    private final RezeptRepository rezeptRepository;
    private final RezeptMapper rezeptMapper;

    public RezeptService(RezeptRepository rezeptRepository, RezeptMapper rezeptMapper) {
        this.rezeptRepository = rezeptRepository;
        this.rezeptMapper = rezeptMapper;
    }

    public Rezept speicherRezept(Rezept rezept) {
        if (rezept.getExterneId() != null
                && rezeptRepository.existsByExterneId(rezept.getExterneId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Dieses Rezept existiert bereits!"
            );
        }

        return rezeptRepository.save(rezept);
    }

    @Transactional(readOnly = true)
    public List<GespeichertesRezeptDto> holeAlleRezepte() {
        return rezeptRepository.findAll()
                .stream()
                .map(rezeptMapper::wandleEntityInDtoUm)
                .toList();
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

        for (ZutatDto zutatDto : externesRezeptDto.zutaten()) {
            RezeptZutat rezeptZutat = new RezeptZutat(
                    zutatDto.name(),
                    zutatDto.menge()
            );
            rezept.fuegeZutatHinzu(rezeptZutat);
        }

        return rezept;
    }

    @Transactional
    public GespeichertesRezeptDto speichereExternesRezept(
            ExternesRezeptDto externesRezeptDto
    ) {
        Rezept rezept = wandleDtoInRezeptUm(externesRezeptDto);
        Rezept gespeichertesRezept = speicherRezept(rezept);

        return rezeptMapper.wandleEntityInDtoUm(gespeichertesRezept);
    }
}
