package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.request.LoginRequest;
import com.gencand.gencand_api.dto.response.AuthResponse;
import com.gencand.gencand_api.service.AuthService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.autenticar(
                request.email(),
                request.senha()
        );

        return ResponseEntity.ok(response);
    }
}
