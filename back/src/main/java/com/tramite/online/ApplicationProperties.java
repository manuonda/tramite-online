package com.tramite.online;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app")
@Validated
public record ApplicationProperties(
     String supportEmail,
     @DefaultValue("10") int rowsPerPage,
     CorsProperties cors,
     OpenAPIProperties openAPi
) {

    public record CorsProperties(
            @DefaultValue("/api/*") String pathPattern,
            @DefaultValue("*") String allowedOrigins,
            @DefaultValue("*") String allowedMethods,
            @DefaultValue("*") String allowedHeaders
    ){}

    public record OpenAPIProperties(
            @DefaultValue("Tramites Online") String title,
            @DefaultValue("") String description,
            @DefaultValue("v1.0.0") String version,
            Contact contact){}

    public record Contact(
            @DefaultValue("dgarcia(manuonda)") String name,
            @DefaultValue("manuonda@gmail.com") String email) {}
}
