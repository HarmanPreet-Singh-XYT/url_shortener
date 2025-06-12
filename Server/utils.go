package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/HarmanPreet-Singh-XYT/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func sortMiddlewareAuth(c *gin.Context) database.User {
	val, ok := c.Get("currentUser")
	if !ok {
		c.AbortWithStatus(http.StatusInternalServerError)
	}
	user, ok := val.(database.User) // OR *(User) if you stored a pointer
	if !ok {
		c.AbortWithError(500, errors.New("type assertion failed"))
	}
	return user
}
func createToken(id uuid.UUID, expiry time.Duration, tokenSecret string) (string, error) {
	// Create a new JWT token with claims
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": id,                            // Subject (user identifier)
		"iss": "urlShortener",                // Issuer
		"exp": time.Now().Add(expiry).Unix(), // Expiration time
		"iat": time.Now().Unix(),             // Issued at
	})
	tokenString, err := claims.SignedString(tokenSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

const charset = "abcdefghijklmnopqrstuvwxyz0123456789"

func GenerateRandomString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func sortAnalyticsData(data *Analytics, rows []database.AnalyticsRetrievalRow) {
	for _, val := range rows {
		data.TotalClicks++
		if val.IsUnique {
			data.UniqueClicks++
		}

		if val.Country != "" {
			data.ByCountry[val.Country]++
		}
		if val.Referrer != "" {
			data.ByReferrer[val.Referrer]++
		}

		date := val.CreatedAt.Format("2006-01-02")
		data.ClicksByDate[date]++

		if val.UtmCampaign != "" {
			data.UTMBreakdown.UTMCampaign[val.UtmCampaign]++
		}
		if val.UtmSource != "" {
			data.UTMBreakdown.UTMSource[val.UtmSource]++
		}
		if val.UtmMedium != "" {
			data.UTMBreakdown.UTMMedium[val.UtmMedium]++
		}

		// Device Analytics
		if val.DeviceType != "" {
			data.DeviceSummary.DeviceType[val.DeviceType]++
		}
		if val.Platform != "" {
			data.DeviceSummary.Platform[val.Platform]++
		}
		if val.Language != "" {
			data.DeviceSummary.Language[val.Language]++
		}
		if val.Resolution != "" {
			data.DeviceSummary.ScreenResolution[val.Resolution]++
		}
		if val.Timezone != "" {
			data.DeviceSummary.Timezone[val.Timezone]++
		}
		if val.UserAgent != "" {
			data.DeviceSummary.UserAgents[val.UserAgent]++
		}
	}
}

func IPLocation(ip string) (string, error) {
	client := &http.Client{}

	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,country", ip)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("User-Agent", "MyGoClient/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var resParameters IPDetail
	json.NewDecoder(resp.Body).Decode(&resParameters)
	return resParameters.Country, nil
}
func (cfg *apiCfg) SaveAnalytics(c *gin.Context, shortLinkId uuid.UUID, data RedirectReq) {
	ip := c.ClientIP()
	country := "Unknown"
	if ip != "::1" && ip != "127.0.0.1" && ip != "localhost" {
		location, err := IPLocation(ip)
		if err != nil {
			log.Fatal("Failed to get IP location")
		} else {
			country = location
		}
	}
	clickID, err := cfg.db.CreateClick(c, database.CreateClickParams{
		ShortLinkID: shortLinkId,
		IpAddress:   ip,
		Country:     country,
		Referrer:    data.Referrer,
		IsUnique:    data.IsUnique,
		UtmSource:   data.UTM.UTMSource,
		UtmMedium:   data.UTM.UTMMedium,
		UtmCampaign: data.UTM.UTMCampaign,
	})
	if err != nil {
		log.Fatal("Failed to create click analytic")
		return
	}
	err1 := cfg.db.CreateDevice(c, database.CreateDeviceParams{
		ClickID:    clickID,
		UserAgent:  data.Device.UserAgent,
		DeviceType: data.Device.DeviceType,
		Language:   data.Device.Language,
		Platform:   data.Device.Platform,
		Resolution: data.Device.ScreenResolution,
		Timezone:   data.Device.Timezone,
	})
	if err1 != nil {
		log.Fatal("Failed to create device analytic")
		return
	}
}
