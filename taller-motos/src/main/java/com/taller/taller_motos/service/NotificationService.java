package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Orden;
import com.taller.taller_motos.model.Repuesto;
import com.taller.taller_motos.model.Servicio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;
import java.util.Optional;

@Service
public class NotificationService {

    @Value("${TWILIO_ACCOUNT_SID:}")
    private String accountSid;

    @Value("${TWILIO_AUTH_TOKEN:}")
    private String authToken;

    @Value("${TWILIO_PHONE_FROM:}")
    private String fromPhone;

    @Value("${TWILIO_WHATSAPP_FROM:}")
    private String whatsappFrom;

    private boolean enabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
            enabled = true;
        }
    }

    public void sendSms(String to, String body) {
        if (!enabled || to == null || to.isEmpty()) return;
        try {
            Message.creator(new PhoneNumber(to), new PhoneNumber(fromPhone), body).create();
        } catch (Exception ex) {
            // log and ignore
            ex.printStackTrace();
        }
    }

    public void sendWhatsApp(String to, String body) {
        if (!enabled || to == null || to.isEmpty() || whatsappFrom == null || whatsappFrom.isEmpty()) return;
        try {
            Message.creator(new PhoneNumber("whatsapp:" + to), new PhoneNumber(whatsappFrom), body).create();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void notifyOrderReceived(Orden orden) {
        if (orden.getCliente() == null) return;
        String to = orden.getCliente().getTelefono();
        String body = String.format("Hola %s, su moto ha ingresado al taller. Orden: %s", orden.getCliente().getNombre(), orden.getNumeroOrden());
        sendSmsIfAvailable(to, body);
    }

    public void notifyAuthorizationNeeded(Orden orden, Servicio servicio) {
        if (orden.getCliente() == null) return;
        String to = orden.getCliente().getTelefono();
        String body = String.format("Estimado %s, se requiere su autorización para el servicio '%s' en la orden %s.", orden.getCliente().getNombre(), servicio.getNombre(), orden.getNumeroOrden());
        sendSmsIfAvailable(to, body);
    }

    public void notifyAuthorizationNeededRepuesto(Orden orden, Repuesto repuesto, Long authRequestId) {
        if (orden.getCliente() == null) return;
        String to = orden.getCliente().getTelefono();
        String body = String.format("Estimado %s, se requiere su autorización para el repuesto '%s' (precio: $%.2f) en la orden %s.", orden.getCliente().getNombre(), repuesto.getNombre(), repuesto.getPrecio(), orden.getNumeroOrden());
        sendSmsIfAvailable(to, body);
    }

    public void notifyRepuestoAdded(Orden orden, Repuesto repuesto) {
        if (orden.getCliente() == null) return;
        String to = orden.getCliente().getTelefono();
        String body = String.format("Se ha agregado el repuesto '%s' (x%d) a su orden %s.", repuesto.getNombre(), Optional.ofNullable(repuesto.getCantidad()).orElse(1), orden.getNumeroOrden());
        sendSmsIfAvailable(to, body);
    }

    public void notifyServicioUpdated(Orden orden, Servicio servicio) {
        if (orden.getCliente() == null) return;
        String to = orden.getCliente().getTelefono();
        String body = String.format("El estado del servicio '%s' ha sido actualizado a '%s' para su orden %s.", servicio.getNombre(), servicio.getEstado(), orden.getNumeroOrden());
        sendSmsIfAvailable(to, body);
    }

    public void notifyOrderCompleted(Orden orden, double totalCost) {
        if (orden.getCliente() == null) return;
        String to = orden.getCliente().getTelefono();
        String body = String.format("Su orden %s ha sido finalizada. Costo total: %.2f", orden.getNumeroOrden(), totalCost);
        sendSmsIfAvailable(to, body);
    }

    private void sendSmsIfAvailable(String to, String body) {
        // try WhatsApp first if configured and number present
        if (whatsappFrom != null && !whatsappFrom.isEmpty()) {
            sendWhatsApp(formatPhone(to), body);
        } else {
            sendSms(formatPhone(to), body);
        }
    }

    private String formatPhone(String raw) {
        if (raw == null) return null;
        // naive: if contains only digits maybe add + prefix if missing
        String t = raw.trim();
        if (!t.startsWith("+")) t = "+" + t;
        return t;
    }
}
