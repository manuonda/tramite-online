package com.tramite.online;

import org.springframework.boot.SpringApplication;

public class TestTramiteApplication {

	public static void main(String[] args) {
		SpringApplication.from(TramiteApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
