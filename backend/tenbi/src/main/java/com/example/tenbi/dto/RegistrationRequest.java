package com.example.tenbi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegistrationRequest {

    @NotBlank
    @Size(min = 3, max = 255)
    private String nombre;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String contrasena;

    @NotBlank
    @Size(min = 6, max = 100)
    private String contrasenaConfirm; // nuevo campo

    @NotBlank
    private String genero; // "M","F","P" (valida en el service)

    @NotNull
    private Short nacionalidadId; // id de Nacionalidad



    // getters & setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public String getContrasenaConfirm() { return contrasenaConfirm; }
    public void setContrasenaConfirm(String contrasenaConfirm) { this.contrasenaConfirm = contrasenaConfirm; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public Short getNacionalidadId() { return nacionalidadId; }
    public void setNacionalidadId(Short nacionalidadId) { this.nacionalidadId = nacionalidadId; }
}
