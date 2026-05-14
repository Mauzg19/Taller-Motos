package com.taller.taller_motos.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long expiresIn;
    private UserDTO user;

    @Data
    @Builder
    public static class UserDTO {
        private String username;
        private String nombre;
        private String email;
        private String role;
    }
}
