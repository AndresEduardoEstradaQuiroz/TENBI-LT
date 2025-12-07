package com.example.tenbi.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Hito")
@Getter
@Setter
@NoArgsConstructor
public class Hito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short idHito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LineaTiempoId", nullable = false)
    @JsonBackReference
    private LineaTiempo lineaTiempo;

    @Column(nullable = false)
    private Integer anio;

    private Byte mes;
    private Byte dia;

    @Column(nullable = false)
    private String tituloHito;

    private Byte relevancia; // puede ser null
    private String descripcionHito;
    private String imagenHito;
    private String url;
}
