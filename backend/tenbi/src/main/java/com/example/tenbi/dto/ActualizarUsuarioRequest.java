package com.example.tenbi.dto;

import com.example.tenbi.entity.Genero;
import lombok.Data;

@Data
public class ActualizarUsuarioRequest {
    private String nombre;
    private Genero genero;
    private Short nacionalidadId;
}
