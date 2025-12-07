package com.example.tenbi.controller;

import com.example.tenbi.entity.Tema;
import com.example.tenbi.repository.TemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/temas")
@CrossOrigin(origins = "http://localhost:4200")
public class TemaController {

    @Autowired
    private TemaRepository temaRepository;

    @GetMapping
    public List<Tema> listarTemas() {
        return temaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Tema> crearTema(@RequestBody Tema tema) {
        if (temaRepository.findByNombreTema(tema.getNombreTema()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        Tema nuevo = temaRepository.save(tema);
        return ResponseEntity.ok(nuevo);
    }
}
