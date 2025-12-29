package com.taller.taller_motos.controller;

import com.taller.taller_motos.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/most-damaged-parts")
    public List<Map<String, Object>> getMostDamagedParts() {
        return reportService.getMostDamagedParts();
    }

    @GetMapping("/revenue-by-service")
    public List<Map<String, Object>> getRevenueByService() {
        return reportService.getRevenueByService();
    }

    @GetMapping("/technician-efficiency")
    public List<Map<String, Object>> getTechnicianEfficiency() {
        return reportService.getTechnicianEfficiency();
    }

    @GetMapping("/average-repair-time")
    public Map<String, Object> getAverageRepairTime() {
        return reportService.getAverageRepairTime();
    }
}
