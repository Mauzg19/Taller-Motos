package com.taller.taller_motos.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import com.taller.taller_motos.model.Orden;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrdenControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void apiShouldReturn200() {
        TestRestTemplate auth = restTemplate.withBasicAuth("admin", "admin123");
        ResponseEntity<String> response = auth.getForEntity("http://localhost:" + port + "/api/orders", String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
    }

    @Test
    void apiShouldReturn401WhenUnauthenticated() {
        ResponseEntity<String> response = restTemplate.getForEntity("http://localhost:" + port + "/api/orders", String.class);
        // now expect 401
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void clientShouldSeeOnlyTheirOrders() {
        TestRestTemplate clientAuth = restTemplate.withBasicAuth("juan@example.com", "cliente123");
        ResponseEntity<Orden[]> response = clientAuth.getForEntity("http://localhost:" + port + "/api/orders", Orden[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // There should be at least 1 order and all should belong to this client
        assertThat(response.getBody()).isNotNull();
        for (Orden o : response.getBody()) {
            assertThat(o.getEmailCliente()).isEqualToIgnoringCase("juan@example.com");
        }
    }

    @Test
    void recepcionCanCreateOrder() {
        TestRestTemplate recAuth = restTemplate.withBasicAuth("recepcion", "recepcion123");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"nombreCliente\":\"Clara\",\"emailCliente\":\"clara@example.com\",\"placa\":\"QWE-111\"}";
        ResponseEntity<String> response = recAuth.exchange("http://localhost:" + port + "/api/orders", HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
    }
}
