package com.example.tenbi.dto;

import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.Genero;
import com.example.tenbi.entity.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioDTO {
    private Short idUsuario;
    private String nombre;
    private String email;
    private String fotoPerfil;
    private String fotoGoogle;
    private Genero genero;
    private Nacionalidad nacionalidad;
    private TipoUsuario tipoUsuario;
}
