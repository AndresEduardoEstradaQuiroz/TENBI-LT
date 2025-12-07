package com.example.tenbi.controller;

import com.example.tenbi.entity.Nacionalidad;
import com.example.tenbi.entity.TipoUsuario;
import com.example.tenbi.repository.NacionalidadRepository;
import com.example.tenbi.repository.TipoUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalogos")
@RequiredArgsConstructor
public class CatalogosController {

    private final NacionalidadRepository nacionalidadRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;

    //  Listar todas las nacionalidades
    @GetMapping("/nacionalidades")
    public List<Nacionalidad> getNacionalidades() {
        return nacionalidadRepository.findAll();
    }

    //  Listar todos los tipos de usuario
    @GetMapping("/tipos-usuario")
    public List<TipoUsuario> getTiposUsuario() {
        return tipoUsuarioRepository.findAll();
    }
}
