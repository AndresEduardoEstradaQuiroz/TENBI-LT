package com.example.tenbi.security;

import com.example.tenbi.entity.Genero;
import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.TipoUsuario;
import com.example.tenbi.entity.Usuario;
import com.example.tenbi.repository.NacionalidadRepository;
import com.example.tenbi.repository.TipoUsuarioRepository;
import com.example.tenbi.repository.UsuarioRepository;
import com.example.tenbi.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final NacionalidadRepository nacionalidadRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User principal = (OAuth2User) authentication.getPrincipal();

        String email = principal.getAttribute("email");
        String nombre = principal.getAttribute("name");
        String foto = principal.getAttribute("picture");

        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() -> {
            TipoUsuario tipoCreador = tipoUsuarioRepository.findById((short)2)
                    .orElseThrow(() -> new RuntimeException("TipoUsuario con Id=2 no encontrado"));
            Nacionalidad defaultNacionalidad = nacionalidadRepository.findById((short)1)
                    .orElseThrow(() -> new RuntimeException("Nacionalidad default no encontrada"));

            Usuario nuevo = new Usuario();
            nuevo.setGoogleId(principal.getName());
            nuevo.setEmail(email);
            nuevo.setNombre(nombre);
            nuevo.setFotoPerfil(foto);
            nuevo.setContrasena("GOOGLE");
            nuevo.setTipoUsuario(tipoCreador);
            nuevo.setGenero(Genero.P); // pendiente
            nuevo.setNacionalidad(defaultNacionalidad);
            nuevo.setFechaCreacion(LocalDateTime.now());

            return usuarioRepository.save(nuevo);
        });

        String jwt = jwtTokenProvider.generateToken(usuario.getEmail());

        // Redirigimos **solo** con token y email (evita JSON en la URL).
        URI redirectUri = UriComponentsBuilder
                .fromUriString("http://localhost:4200/login-success")
                .queryParam("token", jwt)
                .queryParam("email", usuario.getEmail())
                .build()
                .toUri();

        response.sendRedirect(redirectUri.toString());
    }
}
