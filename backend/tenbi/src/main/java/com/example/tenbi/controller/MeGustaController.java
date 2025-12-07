package com.example.tenbi.controller;

import com.example.tenbi.repository.MeGustaRepository;
import com.example.tenbi.service.MeGustaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/megustas")
@CrossOrigin(origins = "http://localhost:4200")
public class MeGustaController {

    @Autowired
    private MeGustaService meGustaService;
    @Autowired
    private MeGustaRepository meGustaRepository;


    /**
     * Toggle me gusta para la línea especificada.
     * Devuelve { estado: "S"|"N", contador: <long> }
     */
    @PostMapping("/toggle/{idLinea}")
    public ResponseEntity<?> toggleMeGusta(@PathVariable Short idLinea) {
        MeGustaService.ToggleResponse resp = meGustaService.toggleMeGusta(idLinea);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/estado/{idLinea}")
    public ResponseEntity<?> estadoMeGusta(@PathVariable Short idLinea) {

        boolean activo = meGustaService.estadoMeGusta(idLinea);

        long contador = meGustaRepository.countByLineaTiempoIdLineaTiempoAndActivo(
                idLinea, (byte) 1
        );

        return ResponseEntity.ok(
                Map.of(
                        "activo", activo,
                        "contador", contador
                )
        );
    }



}
