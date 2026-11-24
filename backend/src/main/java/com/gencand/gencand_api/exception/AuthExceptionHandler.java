package com.gencand.gencand_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail tratarCredenciaisInvalidas(
            BadCredentialsException exception) {

        return ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                "E-mail ou senha inválidos"
        );
    }
    
    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail tratarErroDeRegra(ResponseStatusException exception) {
        String detalhe = exception.getReason() == null || exception.getReason().isBlank()
                ? "Não foi possível concluir a solicitação."
                : exception.getReason();
        return ProblemDetail.forStatusAndDetail(exception.getStatusCode(), detalhe);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail tratarDadosInvalidos(MethodArgumentNotValidException exception) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Revise os campos informados."
        );
        problema.setProperty("errors", exception.getBindingResult().getFieldErrors().stream()
                .map(erro -> Map.of(
                        "field", erro.getField(),
                        "message", "Valor inválido."
                ))
                .toList());
        return problema;
    }
}

