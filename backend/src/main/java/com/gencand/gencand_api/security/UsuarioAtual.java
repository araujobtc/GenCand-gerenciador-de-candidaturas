package com.gencand.gencand_api.security;

import java.lang.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal(
        expression = "T(java.util.UUID).fromString(subject)",
        errorOnInvalidType = true
)
public @interface UsuarioAtual {
}
