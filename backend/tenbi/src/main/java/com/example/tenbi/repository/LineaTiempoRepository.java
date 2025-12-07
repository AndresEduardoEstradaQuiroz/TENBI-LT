package com.example.tenbi.repository;

import com.example.tenbi.entity.LineaTiempo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface LineaTiempoRepository extends JpaRepository<LineaTiempo, Short> {
    List<LineaTiempo> findByUsuarioIdUsuario(Short idUsuario);
    List<LineaTiempo> findByUsuarioIdUsuarioAndEsFavorita(Short idUsuario, String esFavorita);
    List<LineaTiempo> findByUsuarioIdUsuarioAndEsEliminada(Short idUsuario, String esEliminada);
    List<LineaTiempo> findByEsEliminada(String esEliminada);


    @Modifying
    @Query("UPDATE LineaTiempo lt SET lt.contadorMeGusta = lt.contadorMeGusta + :valor WHERE lt.idLineaTiempo = :id")
    void updateContadorMeGusta(@Param("valor") int valor, @Param("id") Integer idLineaTiempo);

    @Modifying
    @Query("UPDATE LineaTiempo lt SET lt.contadorGuardados = lt.contadorGuardados + :valor WHERE lt.idLineaTiempo = :id")
    void updateContadorGuardados(@Param("valor") int valor, @Param("id") Integer idLineaTiempo);
    @Query("SELECT l FROM LineaTiempo l ORDER BY l.contadorMeGusta DESC")
    List<LineaTiempo> obtenerTopMasMegusta(Pageable pageable);

    @Modifying
    @Query("UPDATE LineaTiempo lt SET lt.esEliminada = 'S', lt.fechaEliminacion = CURRENT_TIMESTAMP WHERE lt.idLineaTiempo = :id")
    void eliminarLogico(@Param("id") Short id);


}
