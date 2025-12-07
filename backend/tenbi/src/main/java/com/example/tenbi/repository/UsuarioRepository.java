package com.example.tenbi.repository;

import com.example.tenbi.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Short> {
    Optional<Usuario> findByGoogleId(String googleId);
    Optional<Usuario> findByEmail(String email);
    //  NUEVO MÉTODO: Buscar por token (para validar el enlace de restablecimiento)
    Optional<Usuario> findByResetPasswordToken(String resetPasswordToken);
}
