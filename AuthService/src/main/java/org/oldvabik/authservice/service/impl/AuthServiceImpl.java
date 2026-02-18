package org.oldvabik.authservice.service.impl;

import org.oldvabik.authservice.dto.*;
import org.oldvabik.authservice.entity.Credential;
import org.oldvabik.authservice.entity.RefreshToken;
import org.oldvabik.authservice.exception.AlreadyExistsException;
import org.oldvabik.authservice.exception.BadRequestException;
import org.oldvabik.authservice.exception.NotFoundException;
import org.oldvabik.authservice.exception.TokenValidationException;
import org.oldvabik.authservice.repository.CredentialRepository;
import org.oldvabik.authservice.repository.RefreshTokenRepository;
import org.oldvabik.authservice.security.JwtProvider;
import org.oldvabik.authservice.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private final CredentialRepository credentialRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(CredentialRepository credentialRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           JwtProvider jwtProvider,
                           PasswordEncoder passwordEncoder) {
        this.credentialRepository = credentialRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public AuthResponse login(AuthRequest request) {
        Credential user = credentialRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        String access = jwtProvider.generateToken(user.getEmail(), user.getRole().name());
        String refresh = jwtProvider.generateRefreshToken(user.getEmail());

        refreshTokenRepository.deleteByEmail(user.getEmail());

        refreshTokenRepository.save(RefreshToken.builder()
                .email(user.getEmail())
                .token(refresh)
                .build());

        return new AuthResponse(access, refresh);
    }

    @Override
    public boolean validate(ValidateTokenRequest token) {
        boolean valid = jwtProvider.validateToken(token);
        if (!valid) {
            throw new TokenValidationException("Invalid or expired token");
        }
        return true;
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        String email = token.getEmail();
        Credential user = credentialRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!jwtProvider.validateRawToken(request.getRefreshToken())) {
            refreshTokenRepository.deleteByEmail(email);
            throw new TokenValidationException("Expired or invalid refresh token");
        }

        String newAccess = jwtProvider.generateToken(email, user.getRole().name());
        String newRefresh = jwtProvider.generateRefreshToken(email);

        token.setToken(newRefresh);
        refreshTokenRepository.save(token);

        return new AuthResponse(newAccess, newRefresh);
    }

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (credentialRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AlreadyExistsException("User already exists");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long");
        }

        Credential credential = Credential.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        Credential saved = credentialRepository.save(credential);
        return new RegisterResponse(saved.getId(), "User registered successfully");
    }

    @Override
    @Transactional
    public void deleteCredential(Long id) {
        Credential credential = credentialRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Credential with id " + id + " not found"));

        refreshTokenRepository.deleteByEmail(credential.getEmail());
        credentialRepository.delete(credential);
    }


}