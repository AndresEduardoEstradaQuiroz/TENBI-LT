package com.example.tenbi.controller;

import com.example.tenbi.dto.ForgotPasswordRequest;
import com.example.tenbi.dto.ResetPasswordRequest;
import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.Usuario;
import com.example.tenbi.repository.NacionalidadRepository;
import com.example.tenbi.repository.UsuarioRepository;
import com.example.tenbi.security.JwtTokenProvider;
import com.example.tenbi.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final NacionalidadRepository nacionalidadRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioService usuarioService; // Debe ser final

    @Value("${frontend.url:http://localhost:4200}")
    private String frontendUrl;

    // ENDPOINTS DE PERFIL Y CONFIGURACIÓN (EXISTENTES)

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "No token provided"));
        }

        String token = authHeader.replace("Bearer ", "");
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        String email = jwtTokenProvider.getUsernameFromToken(token);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean necesitaCompletarPerfil = usuario.getGenero() == null
                || usuario.getGenero().name().equals("P")
                || usuario.getNacionalidad() == null
                || usuario.getNacionalidad().getIdNacionalidad() == 1;

        return ResponseEntity.ok(Map.of(
                "usuario", usuario,
                "necesitaCompletarPerfil", necesitaCompletarPerfil
        ));
    }

    // Completar perfil
    @PostMapping("/completar-perfil")
    public ResponseEntity<?> completarPerfil(@RequestBody Usuario datos) {
        Usuario usuario = usuarioRepository.findByEmail(datos.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Nacionalidad nacionalidad = nacionalidadRepository.findById(datos.getNacionalidad().getIdNacionalidad())
                .orElseThrow(() -> new RuntimeException("Nacionalidad no encontrada"));

        usuario.setNacionalidad(nacionalidad);
        usuario.setGenero(datos.getGenero());

        Usuario saved = usuarioRepository.save(usuario);

        // Devolver usuario actualizado y flag a frontend
        boolean necesitaCompletarPerfil = saved.getGenero() == null
                || saved.getGenero().name().equals("P")
                || saved.getNacionalidad().getIdNacionalidad() == 1;

        return ResponseEntity.ok(Map.of("usuario", saved, "necesitaCompletarPerfil", necesitaCompletarPerfil));
    }

    // Listado de nacionalidades
    @GetMapping("/nacionalidades")
    public Iterable<Nacionalidad> getNacionalidades() {
        return nacionalidadRepository.findAll();
    }



    // ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA

    // ENDPOINT 1: SOLICITAR RESTABLECIMIENTO (Angular envía el email)

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            // Llama al servicio para manejar la lógica de generación de token y envío de correo
            usuarioService.forgotPassword(request.getEmail(), frontendUrl);

            // Mensaje de éxito genérico para seguridad
            return ResponseEntity.ok(Map.of("message", "Se ha enviado un enlace de recuperación (si el correo existe)"));
        } catch (ResponseStatusException e) {
            // Captura la excepción de seguridad del servicio (el mensaje genérico)
            if (e.getStatusCode() == HttpStatus.OK) {
                return ResponseEntity.ok(Map.of("message", e.getReason()));
            }
            // Lanza otros errores si los hubiera
            return new ResponseEntity<>(Map.of("error", e.getReason()), e.getStatusCode());
        }
    }


    // ENDPOINT 2: RESTABLECER CONTRASEÑA (Angular envía el token y la nueva contraseña)

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {

        // 0. Validar que las contraseñas coincidan
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new ResponseEntity<>(Map.of("error", "Las contraseñas no coinciden."), HttpStatus.BAD_REQUEST);
        }

        // 0.1) validar seguridad de contraseña
        String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        if (!request.getNewPassword().matches(passwordPattern)) {
            return new ResponseEntity<>(Map.of("error",
                    "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial"),
                    HttpStatus.BAD_REQUEST);
        }

        try {
            // Llama al servicio para validar el token y actualizar la contraseña
            usuarioService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(Map.of("error", e.getReason()), e.getStatusCode());
        }
    }
}