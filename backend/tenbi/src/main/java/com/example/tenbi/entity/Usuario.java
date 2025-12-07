package com.example.tenbi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuario")
    private Short idUsuario;

    @Column(name = "GoogleId", unique = true)
    private String googleId;

    @Column(name = "Email", nullable = false, unique = true)
    private String email;

    @Column(name = "Nombre", nullable = false)
    private String nombre;

    @Column(name = "Contrasena", nullable = false)
    private String contrasena;

    @Column(name = "ResetPasswordToken")
    private String resetPasswordToken;

    @Column(name = "TokenExpiryDate")
    private LocalDateTime tokenExpiryDate;


    @Column(name = "FotoPerfil")
    private String fotoPerfil;

    @Enumerated(EnumType.STRING)
    @Column(name = "Genero", nullable = false)
    private Genero genero;

    @ManyToOne
    @JoinColumn(name = "IdTipoUsuario", nullable = false)
    private TipoUsuario tipoUsuario;

    @ManyToOne
    @JoinColumn(name = "IdNacionalidad", nullable = false)
    private Nacionalidad nacionalidad;

    @Column(name = "FechaCreacion", nullable = false, updatable = false,
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;

}
