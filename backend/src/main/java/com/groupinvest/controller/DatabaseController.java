package com.groupinvest.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/database")
public class DatabaseController {

    @GetMapping("/info")
    public Map<String, Object> getDatabaseInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("database", "Supabase PostgreSQL");
        info.put("project_id", "cyoxeixmmatjhcryntur");
        info.put("dashboard_url", "https://supabase.com/dashboard/project/cyoxeixmmatjhcryntur");
        info.put("tables", List.of("profiles", "stocks", "investment_groups", "group_members", "user_portfolios"));
        
        Map<String, String> access = new HashMap<>();
        access.put("dashboard", "Login to https://supabase.com/dashboard");
        access.put("table_editor", "Use Table Editor to view/edit data");
        access.put("sql_editor", "Use SQL Editor to run custom queries");
        access.put("react_app", "View data through your React frontend");
        
        info.put("access_methods", access);
        return info;
    }
    
    @GetMapping("/tables")
    public Map<String, Object> getTableStructure() {
        Map<String, Object> tables = new HashMap<>();
        
        Map<String, String> profiles = new HashMap<>();
        profiles.put("description", "User profiles and authentication data");
        profiles.put("fields", "id, email, full_name, avatar_url, created_at, updated_at");
        
        Map<String, String> stocks = new HashMap<>();
        stocks.put("description", "Available stocks for investment");
        stocks.put("fields", "id, symbol, name, current_price, market_cap, sector, created_at, updated_at");
        
        Map<String, String> groups = new HashMap<>();
        groups.put("description", "Investment groups");
        groups.put("fields", "id, name, description, created_by, target_amount, current_amount, is_active, created_at, updated_at");
        
        Map<String, String> members = new HashMap<>();
        members.put("description", "Group membership data");
        members.put("fields", "id, group_id, user_id, investment_amount, joined_at");
        
        Map<String, String> portfolios = new HashMap<>();
        portfolios.put("description", "User investment portfolios");
        portfolios.put("fields", "id, user_id, stock_id, quantity, purchase_price, purchase_date, current_value");
        
        tables.put("profiles", profiles);
        tables.put("stocks", stocks);
        tables.put("investment_groups", groups);
        tables.put("group_members", members);
        tables.put("user_portfolios", portfolios);
        
        return tables;
    }
}
