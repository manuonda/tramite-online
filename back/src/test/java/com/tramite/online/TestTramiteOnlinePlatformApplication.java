package com.tramite.online;

import org.springframework.boot.SpringApplication;

public class TestTramiteOnlinePlatformApplication {

	public static void main(String[] args) {
		SpringApplication.from(TramiteOnlinePlatformApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
