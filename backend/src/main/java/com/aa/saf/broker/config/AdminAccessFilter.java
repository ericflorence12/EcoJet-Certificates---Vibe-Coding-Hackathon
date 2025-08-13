package com.aa.saf.broker.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Logger;

@Component
public class AdminAccessFilter extends OncePerRequestFilter {

    private static final Logger logger = Logger.getLogger(AdminAccessFilter.class.getName());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Only check admin paths
        if (requestPath.startsWith("/api/admin")) {
            logger.info("🔒 Checking admin access for path: " + requestPath);
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warning("❌ Unauthorized access attempt to admin endpoint: " + requestPath);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Authentication required\"}");
                response.setContentType("application/json");
                return;
            }
            
            // For now, just check if user is authenticated. 
            // We'll implement proper role checking later when we have JWT tokens
            // that include role information
            logger.info("✅ Admin access granted for path: " + requestPath + " (user: " + authentication.getName() + ")");
        }
        
        filterChain.doFilter(request, response);
    }
}