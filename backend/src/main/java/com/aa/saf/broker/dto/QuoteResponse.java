package com.aa.saf.broker.dto;

import java.math.BigDecimal;

public class QuoteResponse {
    private double safVolume;
    private BigDecimal priceUsd;
    private String userEmail;

    public QuoteResponse() {}

    public double getSafVolume() {
        return safVolume;
    }

    public void setSafVolume(double safVolume) {
        this.safVolume = safVolume;
    }

    public BigDecimal getPriceUsd() {
        return priceUsd;
    }

    public void setPriceUsd(BigDecimal priceUsd) {
        this.priceUsd = priceUsd;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
