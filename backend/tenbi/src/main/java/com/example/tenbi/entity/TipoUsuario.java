package com.example.tenbi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TipoUsuario")
@Getter
@Setter
@NoArgsConstructor
public class TipoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdTipoUsuario")
    private Short idTipoUsuario;

    @Column(name = "NombreTipo", nullable = false, unique = true)
    private String nombreTipo;
}
