package com.example.tenbi.controller;

import com.example.tenbi.dto.*;
import com.example.tenbi.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<RegistrationResponse> registrar(@Valid @RequestBody RegistrationRequest req) {
        RegistrationResponse res = usuarioService.registrarUsuario(req);
        return ResponseEntity.status(201).body(res);
    }
    @PostMapping("/login-tradicional")
    public ResponseEntity<?> loginTradicional(@Valid @RequestBody LoginRequest req) {
        try {
            LoginResponse res = usuarioService.loginUsuario(req);
            return ResponseEntity.ok(res);
        } catch (ResponseStatusException ex) {
            // Devuelve mensaje JSON legible al frontend
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno en el servidor"));
        }
    }
    // Obtener información del usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable Short id) {
        UsuarioDTO usuarioDTO = usuarioService.obtenerUsuario(id);
        return ResponseEntity.ok(usuarioDTO);
    }

    // Actualizar información del usuario (nombre, genero, nacionalidad)
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(
            @PathVariable Short id,
            @RequestBody ActualizarUsuarioRequest request) {
        UsuarioDTO usuarioActualizado = usuarioService.actualizarUsuario(id, request);
        return ResponseEntity.ok(usuarioActualizado);
    }

    // Subir o cambiar foto de perfil
    @PostMapping("/{id}/foto")
    public ResponseEntity<UsuarioDTO> actualizarFotoPerfil(
            @PathVariable Short id,
            @RequestParam("file") MultipartFile file) {
        UsuarioDTO usuarioConFoto = usuarioService.actualizarFotoPerfil(id, file);
        return ResponseEntity.ok(usuarioConFoto);
    }
}
