package com.example.tenbi.service;

import com.example.tenbi.entity.Guardado;
import com.example.tenbi.entity.LineaTiempo;
import com.example.tenbi.entity.Usuario;
import com.example.tenbi.repository.GuardadoRepository;
import com.example.tenbi.repository.LineaTiempoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GuardadoService {

    @Autowired
    private GuardadoRepository guardadoRepository;

    @Autowired
    private LineaTiempoRepository lineaTiempoRepository;

    @Transactional
    public ToggleResponse toggleGuardado(Short idLineaTiempo) {
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Short idUsuario = usuarioActual.getIdUsuario();

        Optional<Guardado> opt = guardadoRepository.findByUsuarioIdUsuarioAndLineaTiempoIdLineaTiempo(idUsuario, idLineaTiempo);
        LineaTiempo linea = lineaTiempoRepository.findById(idLineaTiempo)
                .orElseThrow(() -> new RuntimeException("Línea no encontrada"));

        if (opt.isPresent()) {
            Guardado g = opt.get();
            if (g.getActivo() != null && g.getActivo() == 1) {
                // Desactivar
                g.setActivo((byte) 0);
                guardadoRepository.save(g);
                linea.setContadorGuardados((short) Math.max(0, linea.getContadorGuardados() - 1));
                linea.setFechaActualizacion(LocalDateTime.now());
                lineaTiempoRepository.save(linea);
                long total = guardadoRepository.countByLineaTiempoIdLineaTiempoAndActivo(idLineaTiempo, (byte)1);
                return new ToggleResponse("N", total);
            } else {
                // Reactivar
                g.setActivo((byte) 1);
                g.setFechaGuardado(LocalDateTime.now());
                guardadoRepository.save(g);
                linea.setContadorGuardados((short) (linea.getContadorGuardados() + 1));
                linea.setFechaActualizacion(LocalDateTime.now());
                lineaTiempoRepository.save(linea);
                long total = guardadoRepository.countByLineaTiempoIdLineaTiempoAndActivo(idLineaTiempo, (byte)1);
                return new ToggleResponse("S", total);
            }
        } else {
            // Crear nuevo
            Guardado nuevo = new Guardado();
            nuevo.setUsuario(usuarioActual);
            nuevo.setLineaTiempo(linea);
            nuevo.setActivo((byte) 1);
            nuevo.setFechaGuardado(LocalDateTime.now());
            guardadoRepository.save(nuevo);

            linea.setContadorGuardados((short) (linea.getContadorGuardados() + 1));
            linea.setFechaActualizacion(LocalDateTime.now());
            lineaTiempoRepository.save(linea);

            long total = guardadoRepository.countByLineaTiempoIdLineaTiempoAndActivo(idLineaTiempo, (byte)1);
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

    public boolean estadoGuardado(Short idLineaTiempo) {
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Short idUsuario = usuarioActual.getIdUsuario();

        return guardadoRepository
                .findByUsuarioIdUsuarioAndLineaTiempoIdLineaTiempo(idUsuario, idLineaTiempo)
                .map(g -> g.getActivo() == 1)
                .orElse(false);
    }
    public List<LineaTiempo> obtenerGuardadosUsuario() {

        Usuario usuarioActual =
                (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Short idUsuario = usuarioActual.getIdUsuario();

        List<Guardado> guardados =
                guardadoRepository.findAllByUsuarioIdUsuarioAndActivo(idUsuario, (byte) 1);

        List<LineaTiempo> lineas = guardados.stream()
                .map(Guardado::getLineaTiempo)
                .toList();

        // FORZAR carga de relaciones (igual que en listarTodas / listarMisLineas)
        lineas.forEach(linea -> {
            if (linea.getTema() != null) linea.getTema().getNombreTema();
            if (linea.getUsuario() != null) linea.getUsuario().getNombre();
            if (linea.getHitos() != null) linea.getHitos().size();
        });

        return lineas;
    }

}
