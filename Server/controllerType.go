package main

import (
	"time"

	"github.com/HarmanPreet-Singh-XYT/internal/database"
	"github.com/google/uuid"
)

type RegisterReq struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type LoginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type ShortenReq struct {
	URL         string `json:"original_url"`
	Slug        string `json:"slug"`
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
}
type AuthTokenRes struct {
	RefreshToken string `json:"refreshToken"`
	AccessToken  string `json:"accessToken"`
}
type AuthRes struct {
	RefreshToken string    `json:"refreshToken"`
	AccessToken  string    `json:"accessToken"`
	Id           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
}
type TokenReq struct {
	RefreshToken string `json:"refreshToken"`
}
type UserInfoReq struct {
	Id        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
}
type Link struct {
	Slug         string `json:"slug"`
	OriginalURL  string `json:"original_url"`
	CreatedAt    string `json:"created_at"`
	TotalClicks  int    `json:"total_clicks"`
	UniqueClicks int    `json:"unique_clicks"`
}
type LinkReq struct {
	URL         string `json:"original_url"`
	Slug        string `json:"slug"`
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
	CreatedAt   string `json:"created_at"`
}
type DeleteRes struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
type Analytics struct {
	TotalClicks   int             `json:"total_clicks"`
	UniqueClicks  int             `json:"unique_clicks"`
	ByCountry     map[string]int  `json:"by_country"`
	ByReferrer    map[string]int  `json:"by_referrer"`
	UTMBreakdown  UTMB            `json:"utm_breakdown"`
	ClicksByDate  map[string]int  `json:"clicks_by_date"`
	DeviceSummary DeviceAnalytics `json:"device_summary"`
}

type UTMB struct {
	UTMSource   map[string]int `json:"utm_source"`
	UTMMedium   map[string]int `json:"utm_medium"`
	UTMCampaign map[string]int `json:"utm_campaign"`
}

type DeviceAnalytics struct {
	DeviceType       map[string]int `json:"device_type"`
	Platform         map[string]int `json:"platform"`
	Language         map[string]int `json:"language"`
	ScreenResolution map[string]int `json:"screen_resolution"`
	Timezone         map[string]int `json:"timezone"`
	UserAgents       map[string]int `json:"user_agents"`
}

type ProfileUpdateReq struct {
	ResourceType string `json:"type"`
	Value        string `json:"value"`
}
type SuccessRes struct {
	Success bool `json:"success"`
}
type UTMReq struct {
	UTMSource   string `json:"utm_source"`
	UTMMedium   string `json:"utm_medium"`
	UTMCampaign string `json:"utm_campaign"`
}
type SlugReq struct {
	Slug string `json:"slug"`
}
type DeviceStruct struct {
	UserAgent        string `json:"userAgent"`
	DeviceType       string `json:"deviceType"`
	Language         string `json:"language"`
	Platform         string `json:"platform"`
	ScreenResolution string `json:"screenResolution"`
	Timezone         string `json:"timezone"`
}
type RedirectReq struct {
	Device   DeviceStruct `json:"device"`
	IsUnique bool         `json:"isUnique"`
	Referrer string       `json:"referrer"`
	UTM      UTMReq       `json:"utm_parameters"`
}
type RedirectResponse struct {
	OriginalURL string `json:"original_url"`
}
type IPDetail struct {
	Status  string `json:"status"`
	Country string `json:"country"`
}
type ClickWithDevice struct {
	database.Click
	DeviceType string
	Platform   string
	Language   string
	Resolution string
	Timezone   string
	UserAgent  string
}
