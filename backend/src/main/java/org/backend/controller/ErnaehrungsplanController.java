package org.backend.controller;

import org.backend.dto.ErnaehrungsplaneintragDto;
import org.backend.service.ErnaehrungsplanService;
import org.backend.dto.ErnaehrungsplaneintragErstellenDto;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ErnaehrungsplaneintragDto erstelleEintrag(
            @Valid @RequestBody ErnaehrungsplaneintragErstellenDto erstelleEintragErstellenDto)
    {
       return ernaehrungsplanService.erstelleEintrag(erstelleEintragErstellenDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void loescheEintrag(@PathVariable Long id){
        ernaehrungsplanService.loescheEintrag(id);
    }

    @PutMapping("/{id}")
    public ErnaehrungsplaneintragDto bearbeiteEintrag(
            @PathVariable Long id,
            @Valid @RequestBody ErnaehrungsplaneintragErstellenDto erstelleEintragErstellenDto
    ) {
        return ernaehrungsplanService.bearbeiteEintrag(id, erstelleEintragErstellenDto);
    }

    @DeleteMapping("/woche")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leereWoche(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDatum,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDatum
    ) {
        ernaehrungsplanService.leereWoche(startDatum, endDatum);
    }

}
