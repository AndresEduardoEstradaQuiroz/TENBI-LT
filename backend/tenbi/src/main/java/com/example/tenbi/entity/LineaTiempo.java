package com.example.tenbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LineaTiempo")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LineaTiempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short idLineaTiempo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UsuarioId", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdTema")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Tema tema;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 255)
    private String descripcion;

    private String url;

    @Column(name = "PalabrasClave", length = 255)
    private String palabrasClave;

    @Column(name = "ImagenPortada")
    private String imagenPortada;

    @Column(name = "Plantilla")
    private Integer plantilla;

    @Column(name = "FechaCreacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "FechaActualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "EstadoPrivacidad", nullable = false)
    private EstadoPrivacidad estadoPrivacidad = EstadoPrivacidad.P; // P=Publica

    @Column(name = "EsBorrador", length = 1, nullable = false)
    private String esBorrador = "N";

    @Column(name = "EsFavorita", length = 1, nullable = false)
    private String esFavorita = "N";

    @Column(name = "EsEliminada", length = 1, nullable = false)
    private String esEliminada = "N";

    private LocalDateTime fechaEliminacion;

    private Short contadorMeGusta = 0;
    private Short contadorGuardados = 0;

    @OneToMany(mappedBy = "lineaTiempo", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Hito> hitos = new ArrayList<>();

    public void agregarHito(Hito hito) {
        hito.setLineaTiempo(this);
        hitos.add(hito);
    }

}
