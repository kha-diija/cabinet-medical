package com.cabinetmedical.gestioncabinet.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;

@Slf4j
@Component
public class EndpointLogger implements CommandLineRunner {

    private final ApplicationContext applicationContext;

    public EndpointLogger(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(String... args) {
        RequestMappingHandlerMapping requestMappingHandlerMapping =
                applicationContext.getBean("requestMappingHandlerMapping", RequestMappingHandlerMapping.class);

        Map<RequestMappingInfo, HandlerMethod> map = requestMappingHandlerMapping.getHandlerMethods();

        log.info("\n╔════════════════════════════════════════════════════════════════════════════════╗");
        log.info("║                            📡 ROUTES DISPONIBLES                               ║");
        log.info("╠════════════════════════════════════════════════════════════════════════════════╣");

        if (map.isEmpty()) {
            log.info("║  ⚠️  AUCUNE ROUTE TROUVÉE - Aucun @RestController ou @Controller défini     ║");
        } else {
            map.forEach((key, value) -> {
                String methods = key.getMethodsCondition().getMethods().toString();
                String patterns = key.getPathPatternsCondition() != null
                        ? key.getPathPatternsCondition().toString()
                        : key.getPatternsCondition().toString();
                String controller = value.getBeanType().getSimpleName();
                String method = value.getMethod().getName();

                log.info("║  {} {} -> {}.{}()",
                        String.format("%-8s", methods.replace("[", "").replace("]", "")),
                        String.format("%-35s", patterns),
                        controller,
                        method);
            });
        }

        log.info("╠════════════════════════════════════════════════════════════════════════════════╣");
        log.info("║  Total: {} endpoint(s) enregistré(s)                                          ║", map.size());
        log.info("╚════════════════════════════════════════════════════════════════════════════════╝\n");
    }
}