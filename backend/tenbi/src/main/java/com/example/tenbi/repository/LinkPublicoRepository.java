package com.example.tenbi.repository;

import com.example.tenbi.entity.LinkPublicoLineaTiempo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LinkPublicoRepository extends JpaRepository<LinkPublicoLineaTiempo, Integer> {

    Optional<LinkPublicoLineaTiempo> findByTokenAndActivo(String token, Integer activo);

    Optional<LinkPublicoLineaTiempo> findByLineaTiempoIdLineaTiempoAndActivo(Short idLinea, Integer activo);
}
