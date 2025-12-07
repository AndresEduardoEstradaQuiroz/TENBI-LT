package com.example.tenbi.controller;

import com.example.tenbi.repository.GuardadoRepository;
import com.example.tenbi.service.GuardadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/guardados")
@CrossOrigin(origins = "http://localhost:4200")
public class GuardadoController {

    @Autowired
    private GuardadoService guardadoService;
    @Autowired
    private GuardadoRepository guardadoRepository;

    /**
     * Toggle guardado para la línea especificada.}
     */
    @PostMapping("/toggle/{idLinea}")
    public ResponseEntity<?> toggleGuardado(@PathVariable Short idLinea) {
        GuardadoService.ToggleResponse resp = guardadoService.toggleGuardado(idLinea);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/estado/{idLinea}")
    public ResponseEntity<?> estadoGuardado(@PathVariable Short idLinea) {

        boolean activo = guardadoService.estadoGuardado(idLinea);

        long contador = guardadoRepository.countByLineaTiempoIdLineaTiempoAndActivo(
                idLinea, (byte) 1
        );

        return ResponseEntity.ok(
                Map.of(
                        "activo", activo,
                        "contador", contador
                )
        );
    }
    @GetMapping("/mis-guardados")
    public ResponseEntity<?> misGuardados() {
        return ResponseEntity.ok(guardadoService.obtenerGuardadosUsuario());
    }

}
