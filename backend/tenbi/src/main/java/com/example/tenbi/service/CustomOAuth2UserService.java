package com.example.tenbi.service;

import com.example.tenbi.entity.Genero;
import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.TipoUsuario;
import com.example.tenbi.entity.Usuario;
import com.example.tenbi.repository.NacionalidadRepository;
import com.example.tenbi.repository.TipoUsuarioRepository;
import com.example.tenbi.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final NacionalidadRepository nacionalidadRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String nombre = oauth2User.getAttribute("name");
        String foto = oauth2User.getAttribute("picture");

        Usuario usuario = usuarioRepository.findByEmail(email).orElseGet(() -> {
            TipoUsuario tipoCreador = tipoUsuarioRepository.findById((short) 2)
                    .orElseThrow(() -> new RuntimeException("TipoUsuario con Id=2 no encontrado"));

            Nacionalidad defaultNacionalidad = nacionalidadRepository.findById((short) 1)
                    .orElseThrow(() -> new RuntimeException("Nacionalidad default no encontrada"));

            Usuario nuevo = new Usuario();
            nuevo.setGoogleId(oauth2User.getName());
            nuevo.setEmail(email);
            nuevo.setNombre(nombre);
            nuevo.setFotoPerfil(foto);
            nuevo.setContrasena("GOOGLE");
            nuevo.setTipoUsuario(tipoCreador);
            nuevo.setGenero(Genero.P);
            nuevo.setNacionalidad(defaultNacionalidad);
            nuevo.setFechaCreacion(LocalDateTime.now());

            return usuarioRepository.save(nuevo);
        });

        return oauth2User;
    }
}
