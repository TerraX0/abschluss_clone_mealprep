package org.backend.controller;

import org.backend.dto.ExternesRezeptDto;
import org.backend.service.ZufallsRezeptService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rezepte")
public class ZufallsRezeptController {

    private final ZufallsRezeptService zufallsRezeptService;

    public ZufallsRezeptController(ZufallsRezeptService zufallsRezeptService) {
        this.zufallsRezeptService = zufallsRezeptService;
    }

    @GetMapping("/zufall")
    public ExternesRezeptDto holeZufallsRezept() {
        return zufallsRezeptService.holeZufallsRezept();
    }
}