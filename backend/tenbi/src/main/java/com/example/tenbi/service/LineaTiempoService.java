package com.example.tenbi.service;

import com.example.tenbi.dto.LineaTiempoRequest;
import com.example.tenbi.dto.HitoRequest;
import com.example.tenbi.entity.*;
import com.example.tenbi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;


import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LineaTiempoService {

    @Autowired
    private LineaTiempoRepository lineaTiempoRepository;

    @Autowired
    private TemaRepository temaRepository;

    @Autowired
    private LinkPublicoRepository linkPublicoRepository;


    private String guardarImagen(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) return null;

        try {
            String rutaDirectorio = System.getProperty("user.dir") + "/uploads/hitos/";
            File directorio = new File(rutaDirectorio);
            if (!directorio.exists()) directorio.mkdirs();

            String nombreArchivo = System.currentTimeMillis() + "_" + archivo.getOriginalFilename();
            File destino = new File(directorio, nombreArchivo);
            archivo.transferTo(destino);

            // Guardamos solo la ruta relativa accesible desde el navegador
            return "/uploads/hitos/" + nombreArchivo;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar imagen: " + e.getMessage());
        }
    }

    private String guardarPortada(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) return null;

        try {
            String rutaDirectorio = System.getProperty("user.dir") + "/uploads/portadas/";
            File directorio = new File(rutaDirectorio);
            if (!directorio.exists()) directorio.mkdirs();

            String nombreArchivo = System.currentTimeMillis() + "_" + archivo.getOriginalFilename();
            File destino = new File(directorio, nombreArchivo);
            archivo.transferTo(destino);

            return "/uploads/portadas/" + nombreArchivo;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar portada: " + e.getMessage());
        }
    }

    public LineaTiempo crearLineaTiempo(LineaTiempoRequest request) {
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        LineaTiempo linea = new LineaTiempo();
        linea.setUsuario(usuarioActual);
        linea.setTitulo(request.getTitulo());
        linea.setDescripcion(request.getDescripcion());
        linea.setUrl(request.getUrl());
        linea.setPalabrasClave(request.getPalabrasClave());
        linea.setEstadoPrivacidad(EstadoPrivacidad.P);

        if (request.getIdTema() != null) {
            Tema tema = temaRepository.findById(request.getIdTema())
                    .orElseThrow(() -> new RuntimeException("Tema no encontrado"));
            linea.setTema(tema);
        }

        linea.setImagenPortada(guardarPortada(request.getImagenPortada()));
        linea.setPlantilla(request.getPlantilla());

        // Añadir hitos
        if (request.getHitos() != null) {
            for (HitoRequest h : request.getHitos()) {
                Hito hito = new Hito();
                hito.setAnio(h.getAnio());
                hito.setMes(h.getMes());
                hito.setDia(h.getDia());
                hito.setTituloHito(h.getTituloHito());
                hito.setDescripcionHito(h.getDescripcionHito());
                hito.setRelevancia(h.getRelevancia());
                hito.setImagenHito(guardarImagen(h.getImagenHito()));
                hito.setUrl(h.getUrl());
                linea.agregarHito(hito);
            }
        }

        return lineaTiempoRepository.save(linea);
    }
    public List<LineaTiempo> listarTodas() {
        List<LineaTiempo> lineas = lineaTiempoRepository.findByEsEliminada("N");

        // Forzar carga de relaciones
        lineas.forEach(linea -> {
            if (linea.getTema() != null) linea.getTema().getNombreTema();
            if (linea.getUsuario() != null) linea.getUsuario().getIdUsuario();
        });

        return lineas;
    }


    public List<LineaTiempo> listarPorUsuarioActual() {
        Usuario usuarioActual =
                (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<LineaTiempo> lineas =
                lineaTiempoRepository.findByUsuarioIdUsuarioAndEsEliminada(
                        usuarioActual.getIdUsuario(),
                        "N" // solo NO eliminadas
                );

        // Forzar carga
        lineas.forEach(linea -> {
            if (linea.getTema() != null) linea.getTema().getNombreTema();
            if (linea.getUsuario() != null) linea.getUsuario().getNombre();
        });

        return lineas;
    }


    public LineaTiempo obtenerPorId(Short id) {
        return lineaTiempoRepository.findById(id).orElse(null);
    }

    public LineaTiempo actualizarFavorita(Short id, String estado) {
        LineaTiempo linea = lineaTiempoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));
        // Normalizar valor
        String v = "N".equalsIgnoreCase(estado) ? "N" : "S";
        linea.setEsFavorita(v);
        linea.setFechaActualizacion(LocalDateTime.now());
        return lineaTiempoRepository.save(linea);
    }
    public List<LineaTiempo> listarFavoritasDelUsuario() {
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return lineaTiempoRepository.findByUsuarioIdUsuarioAndEsFavorita(usuarioActual.getIdUsuario(), "S");
    }
    public LineaTiempo cambiarPlantilla(Short id, Integer nuevaPlantilla) {
        LineaTiempo linea = lineaTiempoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Línea de tiempo no encontrada"));

        linea.setPlantilla(nuevaPlantilla);
        linea.setFechaActualizacion(LocalDateTime.now());

        return lineaTiempoRepository.save(linea);
    }

    private String generarTokenSeguro() {
        return java.util.UUID.randomUUID().toString().replace("-", "")
                + Long.toHexString(System.currentTimeMillis());
    }

    public String generarLinkPublico(Short idLinea) {
        LineaTiempo linea = lineaTiempoRepository.findById(idLinea)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));

        // Si ya existe uno activo, lo reutilizamos
        var existente = linkPublicoRepository.findByLineaTiempoIdLineaTiempoAndActivo(idLinea, 1);
        if (existente.isPresent()) {
            return existente.get().getToken();
        }

        // Crear nuevo token
        String token = generarTokenSeguro();

        LinkPublicoLineaTiempo nuevo = new LinkPublicoLineaTiempo();
        nuevo.setToken(token);
        nuevo.setLineaTiempo(linea);

        linkPublicoRepository.save(nuevo);

        return token;
    }

    public LineaTiempo obtenerPorTokenPublico(String token) {
        LinkPublicoLineaTiempo link = linkPublicoRepository
                .findByTokenAndActivo(token, 1)
                .orElseThrow(() -> new RuntimeException("Enlace no válido o expirado"));

        // No se toca el SecurityContext ni usuario actual
        return link.getLineaTiempo();
    }


    public void revocarLinkPublico(Short idLinea) {
        linkPublicoRepository.findByLineaTiempoIdLineaTiempoAndActivo(idLinea, 1)
                .ifPresent(link -> {
                    link.setActivo(0);
                    linkPublicoRepository.save(link);
                });
    }

    public List<LineaTiempo> obtenerTop3MasMegusta() {
        Pageable top3 = PageRequest.of(0, 3);
        return lineaTiempoRepository.obtenerTopMasMegusta(top3);
    }
    @Transactional
    public void eliminarLogicamente(Short idLinea) {
        Usuario usuarioActual =
                (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        LineaTiempo linea = lineaTiempoRepository.findById(idLinea)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));

        // Solo puede eliminar sus propias líneas
        if (!linea.getUsuario().getIdUsuario().equals(usuarioActual.getIdUsuario())) {
            throw new RuntimeException("No tienes permisos para eliminar esta línea");
        }

        // Marcar eliminación
        linea.setEsEliminada("S");
        linea.setFechaEliminacion(LocalDateTime.now());

        lineaTiempoRepository.save(linea);
    }

    public List<LineaTiempo> listarEliminadasDelUsuario() {
        Usuario usuarioActual =
                (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<LineaTiempo> lista =
                lineaTiempoRepository.findByUsuarioIdUsuarioAndEsEliminada(
                        usuarioActual.getIdUsuario(), "S"
                );

        // forzar carga de relaciones
        lista.forEach(linea -> {
            if (linea.getTema() != null) linea.getTema().getNombreTema();
            if (linea.getUsuario() != null) linea.getUsuario().getIdUsuario();
        });

        return lista;
    }
    @Transactional
    public void restaurar(Short idLinea) {

        Usuario usuarioActual =
                (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        LineaTiempo linea = lineaTiempoRepository.findById(idLinea)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));

        // Validar que sea su dueño
        if (!linea.getUsuario().getIdUsuario().equals(usuarioActual.getIdUsuario())) {
            throw new RuntimeException("No tienes permisos para restaurar esta línea");
        }

        linea.setEsEliminada("N");
        linea.setFechaEliminacion(null);

        lineaTiempoRepository.save(linea);
    }


    @Transactional
    public void eliminarDefinitivamente(Short idLinea) {

        Usuario usuarioActual =
                (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        LineaTiempo linea = lineaTiempoRepository.findById(idLinea)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));

        // Solo puede eliminar definitivamente lo suyo
        if (!linea.getUsuario().getIdUsuario().equals(usuarioActual.getIdUsuario())) {
            throw new RuntimeException("No tienes permisos para eliminar esta línea");
        }

        // Evitar borrar cosas no eliminadas lógicamente
        if (!"S".equals(linea.getEsEliminada())) {
            throw new RuntimeException("La línea debe estar en estado eliminado antes de borrarse definitivamente");
        }

        lineaTiempoRepository.delete(linea);
    }


}
