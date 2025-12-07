package com.example.tenbi.controller;

import com.example.tenbi.dto.HitoRequest;
import com.example.tenbi.dto.LineaTiempoRequest;
import com.example.tenbi.entity.LineaTiempo;
import com.example.tenbi.service.LineaTiempoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;


@RestController
@RequestMapping("/api/lineas-tiempo")
@CrossOrigin(origins = "http://localhost:4200")
public class LineaTiempoController {

    @Autowired
    private LineaTiempoService lineaTiempoService;
    @Autowired
    private ObjectMapper objectMapper;


    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> crearLineaTiempo(
            @RequestParam("titulo") String titulo,
            @RequestParam(value = "idTema", required = false) Short idTema,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "palabrasClave", required = false) String palabrasClave,
            @RequestParam("plantilla") Integer plantilla,
            @RequestParam(value = "imagenPortada", required = false) MultipartFile portada,
            @RequestParam(value = "imagenesHitos", required = false) MultipartFile[] imagenesHitos,
            @RequestParam("hitos") List<String> hitosJson
    ) throws IOException {

        int totalArchivos = (portada != null ? 1 : 0) + (imagenesHitos != null ? imagenesHitos.length : 0);
        if (totalArchivos > 50) {
            return ResponseEntity.badRequest().body("Solo se permiten hasta 50 archivos por solicitud");
        }

        // Convertir JSON a objetos HitoRequest
        List<HitoRequest> hitos = hitosJson.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, HitoRequest.class);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();

        // Asignar los archivos recibidos a cada HitoRequest según índice
        if (imagenesHitos != null && imagenesHitos.length > 0) {
            for (int i = 0; i < hitos.size(); i++) {
                if (i < imagenesHitos.length) {

                    MultipartFile fichero = imagenesHitos[i];
                    if (fichero != null && !fichero.isEmpty()) {
                        hitos.get(i).setImagenHito(fichero);
                    } else {
                        hitos.get(i).setImagenHito(null);
                    }
                } else {
                    hitos.get(i).setImagenHito(null);
                }
            }
        }


        // Crear request completo
        LineaTiempoRequest request = new LineaTiempoRequest();
        request.setTitulo(titulo);
        request.setIdTema(idTema);
        request.setDescripcion(descripcion);
        request.setUrl(url);
        request.setPalabrasClave(palabrasClave);
        request.setPlantilla(plantilla);
        request.setImagenPortada(portada);
        request.setHitos(hitos);

        LineaTiempo nueva = lineaTiempoService.crearLineaTiempo(request);
        return ResponseEntity.ok(nueva);
    }


    @GetMapping
    public ResponseEntity<List<LineaTiempo>> listarLineasTiempo() {
        List<LineaTiempo> lineas = lineaTiempoService.listarTodas();
        return ResponseEntity.ok(lineas);
    }

    @GetMapping("/mis-lineas")
    public ResponseEntity<List<LineaTiempo>> listarMisLineas() {
        List<LineaTiempo> lineas = lineaTiempoService.listarPorUsuarioActual();
        return ResponseEntity.ok(lineas);
    }


    @GetMapping("/{id}")
    public ResponseEntity<LineaTiempo> obtenerPorId(@PathVariable Short id) {
        LineaTiempo linea = lineaTiempoService.obtenerPorId(id);
        if (linea == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(linea);
    }

    @PutMapping("/{id}/favorita")
    public ResponseEntity<LineaTiempo> actualizarFavorita(
            @PathVariable Short id,
            @RequestParam("estado") String estado) {

        LineaTiempo updated = lineaTiempoService.actualizarFavorita(id, estado);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/favoritas")
    public ResponseEntity<List<LineaTiempo>> listarFavoritas() {
        List<LineaTiempo> favoritas = lineaTiempoService.listarFavoritasDelUsuario();
        return ResponseEntity.ok(favoritas);
    }
    @PutMapping("/{id}/cambiar-plantilla")
    public ResponseEntity<?> cambiarPlantilla(
            @PathVariable Short id,
            @RequestBody(required = true) Map<String, Integer> body
    ) {
        Integer plantillaId = body.get("plantillaId");
        if (plantillaId == null) {
            return ResponseEntity.badRequest().body("plantillaId es obligatorio");
        }

        LineaTiempo actualizada = lineaTiempoService.cambiarPlantilla(id, plantillaId);
        return ResponseEntity.ok(actualizada);
    }

    @PostMapping("/{id}/generar-link")
    public ResponseEntity<?> generarLinkPublico(@PathVariable Short id) {
        String token = lineaTiempoService.generarLinkPublico(id);

        String url = "http://localhost:4200/ver/" + token;

        return ResponseEntity.ok(Map.of("token", token, "url", url));
    }

    @GetMapping("/publico/{token}")
    public ResponseEntity<?> obtenerPublico(@PathVariable String token) {
        try {
            // No toca SecurityContext, solo busca por token
            LineaTiempo lt = lineaTiempoService.obtenerPorTokenPublico(token);
            return ResponseEntity.ok(lt);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Enlace inválido o expirado");
        }
    }


    @DeleteMapping("/{id}/revocar-link")
    public ResponseEntity<?> revocarLink(@PathVariable Short id) {
        lineaTiempoService.revocarLinkPublico(id);
        return ResponseEntity.ok("Link revocado correctamente");
    }
    @GetMapping("/top/me-gusta")
    public ResponseEntity<?> top3MasMegusta() {
        return ResponseEntity.ok(lineaTiempoService.obtenerTop3MasMegusta());
    }

    @PutMapping("/{id}/eliminar")
    public ResponseEntity<?> eliminarLogicamente(@PathVariable Short id) {
        lineaTiempoService.eliminarLogicamente(id);
        return ResponseEntity.ok("Línea eliminada (papelera)");
    }
    @GetMapping("/eliminadas")
    public ResponseEntity<List<LineaTiempo>> listarEliminadas() {
        List<LineaTiempo> lista = lineaTiempoService.listarEliminadasDelUsuario();
        return ResponseEntity.ok(lista);
    }
    @PutMapping("/{id}/restaurar")
    public ResponseEntity<?> restaurar(@PathVariable Short id) {
        lineaTiempoService.restaurar(id);
        return ResponseEntity.ok("Línea restaurada correctamente");
    }
    @DeleteMapping("/{id}/eliminar-definitivo")
    public ResponseEntity<?> eliminarDefinitivo(@PathVariable Short id) {
        lineaTiempoService.eliminarDefinitivamente(id);
        return ResponseEntity.ok("Línea eliminada permanentemente");
    }

}
