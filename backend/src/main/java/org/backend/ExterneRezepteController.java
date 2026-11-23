package org.backend;


import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mealprep")
@CrossOrigin(origins = "http://localhost:5173")
public class ExterneRezepteController {
    private final RezeptService rezeptService;

    public ExterneRezepteController(RezeptService rezeptService) {
        this.rezeptService = rezeptService;
    }

    @GetMapping("/{id}")
    public Rezept getMealById(@PathVariable String id) {
        return rezeptService.getRezeptById(id);
    }

}
