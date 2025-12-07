package com.example.tenbi.service;

import com.example.tenbi.entity.LineaTiempo;
import com.example.tenbi.entity.MeGusta;
import com.example.tenbi.entity.Usuario;
import com.example.tenbi.repository.LineaTiempoRepository;
import com.example.tenbi.repository.MeGustaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MeGustaService {

    @Autowired
    private MeGustaRepository meGustaRepository;

    @Autowired
    private LineaTiempoRepository lineaTiempoRepository;

    /**
     * Toggle like: si no existe lo crea con Activo=1, si existe y Activo=1 lo pone 0, si existe y 0 lo pone 1.
     * Devuelve el nuevo estado ("S" activo / "N" inactivo) y actualiza contador en LineaTiempo.
     */
    @Transactional
    public ToggleResponse toggleMeGusta(Short idLineaTiempo) {
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Short idUsuario = usuarioActual.getIdUsuario();

        Optional<MeGusta> opt = meGustaRepository.findByUsuarioIdUsuarioAndLineaTiempoIdLineaTiempo(idUsuario, idLineaTiempo);
        LineaTiempo linea = lineaTiempoRepository.findById(idLineaTiempo)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));

        if (opt.isPresent()) {
            MeGusta mg = opt.get();
            if (mg.getActivo() != null && mg.getActivo() == 1) {
                // Desactivar
                mg.setActivo((byte) 0);
                meGustaRepository.save(mg);
                // decrementar contador (no bajar de 0)
                Short contador = linea.getContadorMeGusta();
                linea.setContadorMeGusta((short) Math.max(0, contador - 1));
                linea.setFechaActualizacion(LocalDateTime.now());
                lineaTiempoRepository.save(linea);
                long total = meGustaRepository.countByLineaTiempoIdLineaTiempoAndActivo(idLineaTiempo, (byte)1);
                return new ToggleResponse("N", total);
            } else {
                // Reactivar
                mg.setActivo((byte) 1);
                mg.setFechaMeGusta(LocalDateTime.now());
                meGustaRepository.save(mg);
                linea.setContadorMeGusta((short) (linea.getContadorMeGusta() + 1));
                linea.setFechaActualizacion(LocalDateTime.now());
                lineaTiempoRepository.save(linea);
                long total = meGustaRepository.countByLineaTiempoIdLineaTiempoAndActivo(idLineaTiempo, (byte)1);
                return new ToggleResponse("S", total);
            }
        } else {
            // Crear nuevo MeGusta
            MeGusta nuevo = new MeGusta();
            nuevo.setUsuario(usuarioActual);
            nuevo.setLineaTiempo(linea);
            nuevo.setActivo((byte) 1);
            nuevo.setFechaMeGusta(LocalDateTime.now());
            meGustaRepository.save(nuevo);

            linea.setContadorMeGusta((short) (linea.getContadorMeGusta() + 1));
            linea.setFechaActualizacion(LocalDateTime.now());
            lineaTiempoRepository.save(linea);

            long total = meGustaRepository.countByLineaTiempoIdLineaTiempoAndActivo(idLineaTiempo, (byte)1);
            return new ToggleResponse("S", total);
        }
    }

    public static class ToggleResponse {
        private String estado; // "S" o "N"
        private long contador;

        public ToggleResponse(String estado, long contador) {
            this.estado = estado;
            this.contador = contador;
        }

        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        public long getContador() { return contador; }
        public void setContador(long contador) { this.contador = contador; }
    }
    public boolean estadoMeGusta(Short idLineaTiempo) {
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Short idUsuario = usuarioActual.getIdUsuario();

        return meGustaRepository
                .findByUsuarioIdUsuarioAndLineaTiempoIdLineaTiempo(idUsuario, idLineaTiempo)
                .map(m -> m.getActivo() == 1)
                .orElse(false);
    }


}
