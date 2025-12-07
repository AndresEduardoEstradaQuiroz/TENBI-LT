package com.example.tenbi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Nacionalidad")
@Getter
@Setter
@NoArgsConstructor
public class Nacionalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdNacionalidad")
    private Short idNacionalidad;

    @Column(name = "Nacionalidad", nullable = false, unique = true)
    private String nacionalidad;
}
