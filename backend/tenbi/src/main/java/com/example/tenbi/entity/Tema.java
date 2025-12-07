package com.example.tenbi.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "Tema")
public class Tema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short idTema;

    @Column(length = 100, nullable = false, unique = true)
    private String nombreTema;

    public Short getIdTema() {
        return idTema;
    }

    public void setIdTema(Short idTema) {
        this.idTema = idTema;
    }

    public String getNombreTema() {
        return nombreTema;
    }

    public void setNombreTema(String nombreTema) {
        this.nombreTema = nombreTema;
    }
}
