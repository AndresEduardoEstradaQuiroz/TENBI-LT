package com.example.tenbi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "LinkPublicoLineaTiempo")
@Getter @Setter
public class LinkPublicoLineaTiempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idLink;

    @Column(nullable = false, unique = true, length = 60)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdLineaTiempo", nullable = false)
    private LineaTiempo lineaTiempo;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(nullable = false)
    private Integer activo = 1; // 1=activo, 0=revocado
}
