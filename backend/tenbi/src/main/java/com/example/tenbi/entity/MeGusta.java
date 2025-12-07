package com.example.tenbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "MeGusta", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"IdUsuario", "IdLineaTiempo"})
})
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MeGusta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdMeGusta")
    private Short idMeGusta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdLineaTiempo", nullable = false)
    private LineaTiempo lineaTiempo;

    @Column(name = "FechaMeGusta")
    private LocalDateTime fechaMeGusta = LocalDateTime.now();

    @Column(name = "Activo")
    private Byte activo = 1; // 1 = activo, 0 = inactivo
}
