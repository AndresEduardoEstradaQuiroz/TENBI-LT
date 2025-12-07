package com.example.tenbi.repository;

import com.example.tenbi.entity.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoUsuarioRepository extends JpaRepository<TipoUsuario, Short> {
    Optional<TipoUsuario> findByNombreTipo(String nombreTipo);

}
