package com.aa.saf.broker;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "azure.storage.connection-string=DefaultEndpointsProtocol=https;AccountName=mockstorage;AccountKey=dGVzdGtleQ==;EndpointSuffix=core.windows.net",
    "azure.storage.container-name=test-certificates"
})
class SafCertificateBrokerApplicationTests {

	@Test
	void contextLoads() {
		// This test verifies that the Spring application context loads successfully
	}

}
