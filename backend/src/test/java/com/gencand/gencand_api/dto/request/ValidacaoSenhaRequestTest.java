package com.gencand.gencand_api.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ValidacaoSenhaRequestTest {

    private static Validator validator;
    private static ValidatorFactory validatorFactory;

    @BeforeAll
    static void configurarValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void fecharValidator() {
        validatorFactory.close();
    }

    @Test
    void cadastroAceitaSenhaComAte72BytesEmUtf8() {
        RegistroRequest request = new RegistroRequest(
                "teste@exemplo.com",
                "é".repeat(36));

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void cadastroRejeitaSenhaComMaisDe72BytesEmUtf8MesmoComMenosDe50Caracteres() {
        RegistroRequest request = new RegistroRequest(
                "teste@exemplo.com",
                "é".repeat(37));

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void loginRejeitaSenhaComMaisDe72BytesEmUtf8() {
        LoginRequest request = new LoginRequest(
                "teste@exemplo.com",
                "é".repeat(37));

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void loginRejeitaSenhaComMaisDe50Caracteres() {
        LoginRequest request = new LoginRequest(
                "teste@exemplo.com",
                "a".repeat(51));

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void loginAceitaSenhaCom50CaracteresAscii() {
        LoginRequest request = new LoginRequest(
                "teste@exemplo.com",
                "a".repeat(50));

        assertTrue(validator.validate(request).isEmpty());
    }
}
