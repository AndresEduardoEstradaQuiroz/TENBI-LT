package com.example.tenbi.service;

import com.example.tenbi.dto.*;
import com.example.tenbi.entity.Genero;
import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.TipoUsuario;
import com.example.tenbi.entity.Usuario;
import com.example.tenbi.repository.NacionalidadRepository;
import com.example.tenbi.repository.TipoUsuarioRepository;
import com.example.tenbi.repository.UsuarioRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional; //Importes que recien hice
import java.util.UUID; // Igual

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final NacionalidadRepository nacionalidadRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService; //Para recuperar la contraseña

    public RegistrationResponse registrarUsuario(RegistrationRequest req) {
        // 0) validar coincidencia de contraseñas
        if (!req.getContrasena().equals(req.getContrasenaConfirm())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las contraseñas no coinciden");
        }

        // 0.1) validar seguridad de contraseña
                String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
                if (!req.getContrasena().matches(passwordPattern)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial");
                }

        // 1) validar email único
        if (usuarioRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo ya está registrado");
        }

        // 2) validar genero
        Genero generoEnum;
        try {
            generoEnum = Genero.valueOf(req.getGenero());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Género inválido");
        }

        // 3) validar y encontrar nacionalidad
        if (req.getNacionalidadId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nacionalidadId es requerido");
        }

        Nacionalidad nacionalidad = nacionalidadRepository.findById(req.getNacionalidadId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nacionalidad no encontrada"));

        // 4) asignar tipo usuario
        TipoUsuario tipoUsuario = tipoUsuarioRepository.findByNombreTipo("Creador")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "TipoUsuario 'Creador' no encontrado"));

        // 5) crear usuario
        Usuario u = new Usuario();
        u.setNombre(req.getNombre());
        u.setEmail(req.getEmail());
        u.setContrasena(passwordEncoder.encode(req.getContrasena()));
        u.setGenero(generoEnum);
        u.setNacionalidad(nacionalidad);
        u.setTipoUsuario(tipoUsuario);
        u.setFechaCreacion(LocalDateTime.now());
        // googleId y fotoPerfil quedan null por registro tradicional

        Usuario saved = usuarioRepository.save(u);

        // 6) construir response (sin contrasena)
        return new RegistrationResponse(
                saved.getIdUsuario(),
                saved.getNombre(),
                saved.getEmail(),
                saved.getFotoPerfil(),
                saved.getGenero().name(),
                saved.getNacionalidad(),
                saved.getTipoUsuario()
        );
    }
    public LoginResponse loginUsuario(LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(req.getContrasena(), usuario.getContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
        }

        String secretKey = "secret_key_demo_secret_key_demo_secret_key_demo";

        String token = Jwts.builder()
                .setSubject(usuario.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24h
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8)),
                        SignatureAlgorithm.HS256)
                .compact();

        return new LoginResponse(token, usuario);
    }


    // =========================================================
    // LÓGICA DE RECUPERACIÓN DE CONTRASEÑA
    // =========================================================

    /**
     * Procesa la solicitud de recuperación de contraseña.
     * Genera un token, lo guarda en la BD y envía el correo.
     * @param email El correo del usuario registrado.
     * @param frontendUrl La URL base del frontend para el enlace.
     */
    public void forgotPassword(String email, String frontendUrl) {

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (!usuarioOpt.isPresent()) {
            // Por seguridad, siempre lanzamos un mensaje genérico.

            throw new ResponseStatusException(HttpStatus.OK, "Si el email está registrado, recibirás un correo de recuperación.");
        }

        Usuario usuario = usuarioOpt.get();

        // 1. Generar Token Único
        String token = UUID.randomUUID().toString().replace("-", "");

        // 2. Establecer la caducidad (ej. 60 minutos)
        usuario.setResetPasswordToken(token);
        usuario.setTokenExpiryDate(LocalDateTime.now().plusMinutes(60)); // Caduca en 1 hora

        // 3. Guardar el token en la BD
        usuarioRepository.save(usuario);

        // 4. Enviar el correo electrónico
        emailService.sendPasswordResetEmail(email, token, frontendUrl);
    }

    /**
     * Restablece la contraseña si el token es válido y no ha caducado.
     * @param token El token recibido de la URL.
     * @param newPassword La nueva contraseña.
     */
    public void resetPassword(String token, String newPassword) {

        Optional<Usuario> usuarioOpt = usuarioRepository.findByResetPasswordToken(token);

        if (!usuarioOpt.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El token proporcionado no es válido.");
        }

        Usuario usuario = usuarioOpt.get();

        // 1. Verificar la caducidad
        if (usuario.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            // Limpiar el token caducado antes de lanzar la excepción
            usuario.setResetPasswordToken(null);
            usuario.setTokenExpiryDate(null);
            usuarioRepository.save(usuario);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El enlace de restablecimiento ha expirado. Solicita uno nuevo.");
        }

        // 2. Encriptar y actualizar la contraseña
        String encodedPassword = passwordEncoder.encode(newPassword);
        usuario.setContrasena(encodedPassword);

        // 3. Limpiar el token usado
        usuario.setResetPasswordToken(null);
        usuario.setTokenExpiryDate(null);

        // 4. Guardar los cambios
        usuarioRepository.save(usuario);
    }
    // Obtener usuario por ID
    public UsuarioDTO obtenerUsuario(Short id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return new UsuarioDTO(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getFotoPerfil(),
                usuario.getGoogleId() != null ? "https://lh3.googleusercontent.com/a-/"+usuario.getGoogleId() : null,
                usuario.getGenero(),
                usuario.getNacionalidad(),
                usuario.getTipoUsuario()
        );
    }

    // Actualizar nombre, genero y nacionalidad
    public UsuarioDTO actualizarUsuario(Short id, ActualizarUsuarioRequest req) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (req.getNombre() != null && !req.getNombre().isEmpty()) {
            usuario.setNombre(req.getNombre());
        }

        if (req.getGenero() != null) {
            usuario.setGenero(req.getGenero());
        }

        if (req.getNacionalidadId() != null) {
            Nacionalidad nacionalidad = nacionalidadRepository.findById(req.getNacionalidadId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nacionalidad no encontrada"));
            usuario.setNacionalidad(nacionalidad);
        }

        usuarioRepository.save(usuario);

        return new UsuarioDTO(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getFotoPerfil(),
                usuario.getGoogleId() != null ? "https://lh3.googleusercontent.com/a-/"+usuario.getGoogleId() : null,
                usuario.getGenero(),
                usuario.getNacionalidad(),
                usuario.getTipoUsuario()
        );
    }

    // Actualizar foto de perfil
    public UsuarioDTO actualizarFotoPerfil(Short id, MultipartFile file) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Aquí puedes guardar la foto en el servidor o en un bucket y guardar la URL
        // Por ejemplo, lo guardamos en "/uploads/{filename}"
        String nombreArchivo = "user_" + id + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path rutaArchivo = Paths.get("uploads").resolve(nombreArchivo);

        try {
            Files.createDirectories(rutaArchivo.getParent());
            Files.write(rutaArchivo, file.getBytes());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar la foto de perfil");
        }

        usuario.setFotoPerfil("/uploads/" + nombreArchivo);
        usuarioRepository.save(usuario);

        return new UsuarioDTO(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getFotoPerfil(),
                usuario.getGoogleId() != null ? "https://lh3.googleusercontent.com/a-/"+usuario.getGoogleId() : null,
                usuario.getGenero(),
                usuario.getNacionalidad(),
                usuario.getTipoUsuario()
        );
    }

}

