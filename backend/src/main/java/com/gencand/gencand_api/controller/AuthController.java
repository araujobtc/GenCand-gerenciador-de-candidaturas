package com.gencand.gencand_api.controller;

import com.gencand.gencand_api.dto.request.ConfirmacaoEmailRequest;
import com.gencand.gencand_api.dto.request.LoginRequest;
import com.gencand.gencand_api.dto.request.RegistroRequest;
import com.gencand.gencand_api.dto.request.ReenvioConfirmacaoRequest;
import com.gencand.gencand_api.dto.response.AuthResponse;
import com.gencand.gencand_api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registrar(
            @Valid @RequestBody RegistroRequest request) {
        AuthService.ResultadoRegistro resultado =
                authService.registrar(request.email(), request.senha());

        String mensagem = switch (resultado) {
            case CRIADO ->
                    "Cadastro realizado com sucesso! Você já pode fazer login.";
            case JA_CADASTRADO ->
                    "Já existe uma conta cadastrada com este e-mail. Faça login para acessar sua conta.";
        };

        return ResponseEntity.accepted().body(Map.of("mensagem", mensagem));
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<Map<String, String>> reenviarConfirmacao(
            @Valid @RequestBody ReenvioConfirmacaoRequest request) {
        authService.reenviarConfirmacao(request.email());
        return ResponseEntity.accepted().body(Map.of(
                "mensagem",
                "Se existir um cadastro pendente para esse endereço, enviaremos um novo link de confirmação."
        ));
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<Map<String, String>> confirmarEmail(
            @Valid @RequestBody ConfirmacaoEmailRequest request) {
        authService.confirmarEmail(request.token());
        return ResponseEntity.ok(Map.of("mensagem", "E-mail confirmado com sucesso."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.autenticar(request.email(), request.senha());
        return ResponseEntity.ok(response);
    }
}
