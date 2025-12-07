package com.example.tenbi.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class HitoRequest {
    private Integer anio;
    private Byte mes;
    private Byte dia;
    private String tituloHito;
    private Byte relevancia;
    private String descripcionHito;
    private MultipartFile imagenHito;
    private String url;
}
