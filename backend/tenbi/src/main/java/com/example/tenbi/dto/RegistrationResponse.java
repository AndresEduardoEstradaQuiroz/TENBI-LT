package com.example.tenbi.dto;

import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.TipoUsuario;

public class RegistrationResponse {
    private Short idUsuario;
    private String nombre;
    private String email;
    private String fotoPerfil;
    private String genero;
    private Nacionalidad nacionalidad;
    private TipoUsuario tipoUsuario;

    // constructor
    public RegistrationResponse(Short idUsuario, String nombre, String email, String fotoPerfil,
                                String genero, Nacionalidad nacionalidad, TipoUsuario tipoUsuario) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.email = email;
        this.fotoPerfil = fotoPerfil;
        this.genero = genero;
        this.nacionalidad = nacionalidad;
        this.tipoUsuario = tipoUsuario;
    }

    // getters
    public Short getIdUsuario() { return idUsuario; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    public String getFotoPerfil() { return fotoPerfil; }
    public String getGenero() { return genero; }
    public Nacionalidad getNacionalidad() { return nacionalidad; }
    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
}
