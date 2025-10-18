package com.groupinvest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GroupInvestBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GroupInvestBackendApplication.class, args);
        System.out.println("🚀 Backend API is running on http://localhost:8081");
        System.out.println("📊 Your main website continues to run on http://localhost:8080");
    }
}
