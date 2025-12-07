package com.example.tenbi.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class LineaTiempoRequest {
    private String titulo;
    private Short idTema; // puede ser null
    private String descripcion;
    private String url;
    private String palabrasClave;
    private MultipartFile imagenPortada;
    private Integer plantilla;
    private String estadoPrivacidad; // "P" o "N"
    private List<HitoRequest> hitos;
}
