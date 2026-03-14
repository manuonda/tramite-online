package com.tramite.online;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;


@ConfigurationProperties(prefix = "app")
public record ApplicationProperties(
        @DefaultValue("dgarcia") String issuer,
        OpenApiProperties openApi
) {
    public record OpenApiProperties(
            @DefaultValue("Tramite Online API") String title,
            @DefaultValue("1.0.0") String version
    ) {}
}
