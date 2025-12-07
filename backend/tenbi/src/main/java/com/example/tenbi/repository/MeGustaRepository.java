package com.example.tenbi.repository;

import com.example.tenbi.entity.MeGusta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeGustaRepository extends JpaRepository<MeGusta, Short> {

    // Busca por userId y lineaId (usa path properties: usuario.idUsuario y lineaTiempo.idLineaTiempo)
    Optional<MeGusta> findByUsuarioIdUsuarioAndLineaTiempoIdLineaTiempo(Short idUsuario, Short idLineaTiempo);

    long countByLineaTiempoIdLineaTiempoAndActivo(Short idLineaTiempo, Byte activo);
}
