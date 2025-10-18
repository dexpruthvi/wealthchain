package com.groupinvest.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @GetMapping("/portfolio")
    public Map<String, Object> getPortfolioAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalValue", 25000.50);
        analytics.put("dailyChange", 150.25);
        analytics.put("dailyChangePercent", 0.6);
        analytics.put("topPerformer", "AAPL");
        analytics.put("lastUpdated", System.currentTimeMillis());
        return analytics;
    }
    
    @GetMapping("/group/{groupId}")
    public Map<String, Object> getGroupAnalytics(@PathVariable String groupId) {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("groupId", groupId);
        analytics.put("totalMembers", 5);
        analytics.put("totalInvestment", 50000.0);
        analytics.put("monthlyReturn", 2.5);
        analytics.put("bestStock", "GOOGL");
        return analytics;
    }
    
    @GetMapping("/trends")
    public Map<String, Object> getMarketTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        List<Map<String, Object>> stockTrends = new ArrayList<>();
        Map<String, Object> stock1 = new HashMap<>();
        stock1.put("symbol", "AAPL");
        stock1.put("price", 175.25);
        stock1.put("change", 2.5);
        stock1.put("changePercent", 1.45);
        stockTrends.add(stock1);
        
        Map<String, Object> stock2 = new HashMap<>();
        stock2.put("symbol", "GOOGL");
        stock2.put("price", 2850.75);
        stock2.put("change", -15.25);
        stock2.put("changePercent", -0.53);
        stockTrends.add(stock2);
        
        trends.put("stocks", stockTrends);
        trends.put("marketStatus", "OPEN");
        trends.put("timestamp", System.currentTimeMillis());
        
        return trends;
    }
}