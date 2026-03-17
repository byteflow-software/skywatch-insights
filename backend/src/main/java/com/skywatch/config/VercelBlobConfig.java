package com.skywatch.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.blob")
@Getter
@Setter
public class VercelBlobConfig {

    private String token;
    private String publicBaseUrl;
    private String apiUrl = "https://blob.vercel-storage.com";
}
