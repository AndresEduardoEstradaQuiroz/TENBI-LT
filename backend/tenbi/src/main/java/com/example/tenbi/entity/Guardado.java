package com.example.tenbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Guardados", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"IdUsuario", "IdLineaTiempo"})
})
@Getter
@Setter
@NoArgsConstructor
public class Guardado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdGuardado")
    private Short idGuardado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdLineaTiempo", nullable = false)
    private LineaTiempo lineaTiempo;

    @Column(name = "FechaGuardado")
    private LocalDateTime fechaGuardado = LocalDateTime.now();

    @Column(name = "Activo")
    private Byte activo = 1; // 1 = activo, 0 = inactivo
}
