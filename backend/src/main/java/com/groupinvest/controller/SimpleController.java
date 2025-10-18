package com.groupinvest.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class SimpleController {

    // Root endpoint to handle base API requests
    @GetMapping("/")
    public Map<String, String> root() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "GroupInvest Spring Boot API");
        response.put("version", "1.0.0");
        response.put("endpoints", "/api/hello, /api/status, /api/analytics/*");
        response.put("documentation", "Available endpoints listed above");
        return response;
    }

    // Simple endpoint that doesn't interfere with your main website
    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello from Spring Boot!");
        response.put("status", "Your main website is unaffected");
        return response;
    }
    
    @GetMapping("/status")
    public Map<String, String> status() {
        Map<String, String> status = new HashMap<>();
        status.put("backend", "Running on port 8081");
        status.put("frontend", "Still running on port 8080");
        status.put("database", "Still using Supabase");
        return status;
    }
}
