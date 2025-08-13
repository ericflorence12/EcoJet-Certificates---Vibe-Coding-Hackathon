package com.aa.saf.broker.config;

import com.aa.saf.broker.model.User;
import com.aa.saf.broker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminUser();
    }

    private void createAdminUser() {
        String adminEmail = "ericflorence.dev@gmail.com";
        
        // Check if admin user already exists
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("👨‍💼 Admin user already exists: {}", adminEmail);
            return;
        }

        // Create admin user
        User adminUser = new User();
        adminUser.setEmail(adminEmail);
        adminUser.setPassword(passwordEncoder.encode("Ca39a3ca39a3$"));
        adminUser.setFirstName("Eric");
        adminUser.setLastName("Florence");
        adminUser.setCompany("EcoJet Certificates");
        adminUser.setRole(User.UserRole.ADMIN);
        adminUser.setActive(true);

        userRepository.save(adminUser);
        log.info("✅ Admin user created successfully: {}", adminEmail);
        log.info("🔐 Admin password: Ca39a3ca39a3$");
        log.info("🎯 Admin can access /admin dashboard");
    }
}
