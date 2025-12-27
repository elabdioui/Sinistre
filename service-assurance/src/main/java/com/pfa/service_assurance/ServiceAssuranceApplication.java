package com.pfa.service_assurance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class ServiceAssuranceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceAssuranceApplication.class, args);

	}

}
