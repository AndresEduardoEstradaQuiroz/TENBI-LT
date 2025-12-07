package com.example.tenbi.repository;

import com.example.tenbi.entity.Guardado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuardadoRepository extends JpaRepository<Guardado, Short> {

    Optional<Guardado> findByUsuarioIdUsuarioAndLineaTiempoIdLineaTiempo(Short idUsuario, Short idLineaTiempo);

    long countByLineaTiempoIdLineaTiempoAndActivo(Short idLineaTiempo, Byte activo);
    List<Guardado> findAllByUsuarioIdUsuarioAndActivo(Short idUsuario, Byte activo);

}
