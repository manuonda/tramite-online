package com.tramite.online;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

public class ModularityTest {
  static ApplicationModules modules = ApplicationModules.of(TramiteOnlinePlatformApplication.class);

  @Test
    void verifiesModularStructure(){
      modules.verify();
  }
}
