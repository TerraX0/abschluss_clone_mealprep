package org.backend.service;

import org.backend.dto.ExternesRezeptDto;
import org.backend.enums.Kategorie;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.backend.mapper.RezeptMapper;
import tools.jackson.databind.JsonNode;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;

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

    public List<ExternesRezeptDto> sucheNachKategorie(Kategorie kategorie) {
        String apiKategorie = kategorie.zuApiWert();

        JsonNode gewaehlteKategorie;

        try {
            gewaehlteKategorie = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/filter.php")
                            .queryParam("c", apiKategorie)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Die Kategorien konnten nicht geladen werden.",
                    exception
            );
        }
        if (gewaehlteKategorie == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Keine Antwort von TheMealDB erhalten."
            );
        }

        List<ExternesRezeptDto> rezepte = new ArrayList<>();

        JsonNode gerichte = gewaehlteKategorie.path("meals");

        if (gerichte.isArray()) {
            for (JsonNode gericht : gerichte) {

                String id = gericht.path("idMeal").asString("");

                ExternesRezeptDto rezept = ladeRezeptNachId(id);

                rezepte.add(rezept);
            }
        }

        return rezepte;
    }

    public ExternesRezeptDto ladeRezeptNachId(String id) {
        JsonNode antwort;
        try {
            antwort = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/lookup.php")
                            .queryParam("i", id)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Rezeptdetails konnten nicht geladen werden.",
                    exception
            );
        }

        if (antwort == null
                || !antwort.path("meals").isArray()
                || antwort.path("meals").isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Keine Rezeptdetails erhalten."
            );
        }

        return rezeptMapper.wandleGerichtUm(
                antwort.path("meals").get(0)
        );

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
