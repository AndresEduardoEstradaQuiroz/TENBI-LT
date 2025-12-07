package com.example.tenbi.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

import jakarta.servlet.MultipartConfigElement;

@Configuration
public class TomcatConfig {

    // Limitar tamaño máximo de POST en Tomcat
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            connector.setMaxPostSize(50 * 1024 * 1024); // 50 MB máximo total
        });
    }

    // Configuración de subida de archivos en Spring
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(10));    // Máximo por archivo
        factory.setMaxRequestSize(DataSize.ofMegabytes(50)); // Máximo total
        return factory.createMultipartConfig();
    }

}
