package com.groupinvest.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
public class RootController {

    // Handle root path requests
    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> response = new HashMap<>();
        response.put("service", "GroupInvest Spring Boot Backend");
        response.put("status", "Running successfully");
        response.put("port", "8081");
        response.put("api_base", "/api");
        response.put("frontend", "React app on port 8080");
        response.put("message", "Your main website is unaffected");
        return response;
    }
    
    // Handle favicon requests
    @GetMapping("/favicon.ico")
    public void favicon() {
        // Empty method to prevent 404 on favicon requests
    }
}
