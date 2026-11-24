package org.backend.service;

import org.backend.dto.ExternesRezeptDto;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.backend.mapper.RezeptMapper;
import tools.jackson.databind.JsonNode;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Optional;

@Service
public class ExterneRezepteService {
    private final RestClient restClient;
    private final RezeptMapper rezeptMapper;

    public ExterneRezepteService(RestClient restClient, RezeptMapper rezeptMapper) {
        this.restClient = restClient;
        this.rezeptMapper = rezeptMapper;
    }

    public List<ExternesRezeptDto> sucheRezepte(String suchbegriff) {
        JsonNode antwort;
        try {
            antwort = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search.php")
                            .queryParam("s", suchbegriff)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Die externe API ist nicht erreichbar oder hat einen Fehler geliefert.",
                    exception
            );
        }
        if (antwort == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Keine Antwort erhalten."
            );
        }

        return rezeptMapper.wandleSuchergebnisseUm(antwort);
    }

    public ExternesRezeptDto holeEinzelnesExternesRezept(String externeId) {
        JsonNode antwort;
        try {
            antwort = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/lookup.php")
                            .queryParam("i", externeId)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Die externe API ist nicht erreichbar oder hat einen Fehler geliefert.",
                    exception
            );
        }
        if (antwort == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Kein Rezept gefunden."
            );
        }

        return rezeptMapper.wandleSuchergebnisseUm(antwort).getFirst();
    }
}
