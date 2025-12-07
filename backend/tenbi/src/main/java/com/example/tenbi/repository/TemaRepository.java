package com.example.tenbi.repository;

import com.example.tenbi.entity.Tema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TemaRepository extends JpaRepository<Tema, Short> {
    Optional<Tema> findByNombreTema(String nombreTema);
}
