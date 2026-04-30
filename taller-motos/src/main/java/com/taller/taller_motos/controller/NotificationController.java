package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Orden;
import com.taller.taller_motos.repository.OrdenRepository;
import com.taller.taller_motos.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private OrdenRepository ordenRepository;

    /**
     * Send WhatsApp notification to a specific order's customer
     */
    @PostMapping("/whatsapp/order/{orderId}")
    public ResponseEntity<Map<String, Object>> sendWhatsAppNotification(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {

        String message = body.getOrDefault("message", "Actualización de tu orden");

        Orden orden = ordenRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (orden.getCliente() == null || orden.getCliente().getTelefono() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cliente sin teléfono"));
        }

        String phone = formatPhoneNumber(orden.getCliente().getTelefono());
        notificationService.sendWhatsApp(phone, message);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notificación WhatsApp enviada");
        return ResponseEntity.ok(response);
    }

    /**
     * Send SMS notification to a specific order's customer
     */
    @PostMapping("/sms/order/{orderId}")
    public ResponseEntity<Map<String, Object>> sendSmsNotification(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {

        String message = body.getOrDefault("message", "Actualización de tu orden");

        Orden orden = ordenRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        if (orden.getCliente() == null || orden.getCliente().getTelefono() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cliente sin teléfono"));
        }

        String phone = formatPhoneNumber(orden.getCliente().getTelefono());
        notificationService.sendSms(phone, message);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "SMS enviado");
        return ResponseEntity.ok(response);
    }

    /**
     * Send bulk notifications to multiple customers
     */
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> sendBulkNotification(
            @RequestBody Map<String, Object> body) {

        @SuppressWarnings("unchecked")
        List<Long> orderIds = (List<Long>) body.get("orderIds");
        String message = (String) body.getOrDefault("message", "Mensaje del taller");
        String channel = (String) body.getOrDefault("channel", "whatsapp");

        int successCount = 0;
        int failCount = 0;

        for (Long orderId : orderIds) {
            Orden orden = ordenRepository.findById(orderId).orElse(null);
            if (orden != null && orden.getCliente() != null && orden.getCliente().getTelefono() != null) {
                String phone = formatPhoneNumber(orden.getCliente().getTelefono());
                if ("whatsapp".equals(channel)) {
                    notificationService.sendWhatsApp(phone, message);
                } else {
                    notificationService.sendSms(phone, message);
                }
                successCount++;
            } else {
                failCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("successCount", successCount);
        response.put("failCount", failCount);
        response.put("message", "Notificaciones enviadas");
        return ResponseEntity.ok(response);
    }

    /**
     * Send promotional message to all clients
     */
    @PostMapping("/promotional")
    public ResponseEntity<Map<String, Object>> sendPromotionalMessage(
            @RequestBody Map<String, String> body) {

        String message = body.get("message");
        String channel = body.getOrDefault("channel", "whatsapp");

        if (message == null || message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mensaje requerido"));
        }

        List<Orden> allOrders = ordenRepository.findAll();
        Map<String, String> sentPhones = new HashMap<>();

        for (Orden orden : allOrders) {
            if (orden.getCliente() != null && orden.getCliente().getTelefono() != null) {
                String phone = formatPhoneNumber(orden.getCliente().getTelefono());
                if (!sentPhones.containsKey(phone)) {
                    if ("whatsapp".equals(channel)) {
                        notificationService.sendWhatsApp(phone, message);
                    } else {
                        notificationService.sendSms(phone, message);
                    }
                    sentPhones.put(phone, orden.getCliente().getNombre());
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("recipientsCount", sentPhones.size());
        response.put("message", "Mensaje promocional enviado");
        return ResponseEntity.ok(response);
    }

    /**
     * Test notification endpoint
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testNotification(
            @RequestParam String phone,
            @RequestParam String message,
            @RequestParam(defaultValue = "whatsapp") String channel) {

        String formattedPhone = formatPhoneNumber(phone);

        if ("whatsapp".equals(channel)) {
            notificationService.sendWhatsApp(formattedPhone, message);
        } else {
            notificationService.sendSms(formattedPhone, message);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notificación de prueba enviada");
        return ResponseEntity.ok(response);
    }

    private String formatPhoneNumber(String raw) {
        if (raw == null) return null;
        String t = raw.trim();
        if (!t.startsWith("+")) t = "+" + t;
        return t;
    }
}
