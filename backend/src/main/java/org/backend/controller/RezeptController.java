
package org.backend.controller;

import org.backend.service.RezeptService;
import org.backend.dto.ExternesRezeptDto;
import org.backend.dto.GespeichertesRezeptDto;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/rezepte")
public class RezeptController {

    private final RezeptService rezeptService;

    public RezeptController(RezeptService rezeptService) {
        this.rezeptService = rezeptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GespeichertesRezeptDto speichereRezept(
            @RequestBody ExternesRezeptDto externesRezeptDto
    ) {
        return rezeptService.speichereExternesRezept(externesRezeptDto);
    }
}
