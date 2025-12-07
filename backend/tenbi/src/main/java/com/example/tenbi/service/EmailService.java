package com.example.tenbi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envía un correo electrónico simple con un link de recuperación.
     * @param toEmail La dirección de correo del destinatario.
     * @param token El token único de recuperación generado.
     * @param frontendUrl La URL base de tu aplicación Angular (ej. http://localhost:4200).
     */
    public void sendPasswordResetEmail(String toEmail, String token, String frontendUrl) {

        // 1. Construir el enlace completo de restablecimiento

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // 2. Crear el mensaje de correo
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Restablecimiento de Contraseña - Tenbi");

        String emailContent = "Hola,\n\n"
                + "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta Tenbi.\n"
                + "Haz clic en el siguiente enlace para establecer una nueva contraseña:\n\n"
                + resetLink + "\n\n"
                + "Este enlace caducará en 60 minutos. Si no solicitaste este cambio, ignora este correo.\n\n"
                + "Atentamente,\n"
                + "El equipo de Tenbi";

        message.setText(emailContent);

        // 3. Enviar el correo
        try {
            mailSender.send(message);
            System.out.println("Correo de restablecimiento enviado exitosamente a: " + toEmail);
        } catch (MailException e) {
            // Manejo de errores de envío (ej. credenciales de SMTP incorrectas)
            System.err.println("Error al enviar el correo de restablecimiento a " + toEmail + ": " + e.getMessage());

            throw new RuntimeException("No se pudo enviar el correo de recuperación. Verifique la configuración del servidor.", e);
        }
    }
}