package com.example.api.proxy.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class TrackingController {

    @Value("${correios.api.url}")
    private String apiUrl;

    @Value("${correios.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public TrackingController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/track")
    public ResponseEntity<?> trackPackage(@RequestBody TrackRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", "Apikey " + apiKey);

            HttpEntity<TrackRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Object> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    Object.class
            );

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Falha ao rastrear o pacote: " + e.getMessage());
        }
    }
}

