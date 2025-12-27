// service-admin/src/main/java/com/pfa/service_admin/config/SwaggerConfig.java
package com.pfa.service_admin.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Service Admin API")
                        .version("1.0")
                        .description("API pour l'administration et le monitoring"));
    }
}