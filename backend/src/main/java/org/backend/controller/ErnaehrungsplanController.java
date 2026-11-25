package org.backend.controller;

import org.backend.dto.ErnaehrungsplaneintragDto;
import org.backend.service.ErnaehrungsplanService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ernaehrungsplan")
public class ErnaehrungsplanController {

    private final ErnaehrungsplanService ernaehrungsplanService;

    public ErnaehrungsplanController(ErnaehrungsplanService ernaehrungsplanService) {
        this.ernaehrungsplanService = ernaehrungsplanService;
    }

    @GetMapping
    public List<ErnaehrungsplaneintragDto> holeWochenplan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate startDatum,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate endDatum
            ){
        return ernaehrungsplanService.holeWochenplan(startDatum,endDatum);

    }
}
