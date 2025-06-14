package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/HarmanPreet-Singh-XYT/internal/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/acme/autocert"
)

type apiCfg struct {
	db               *database.Queries
	port             string
	frontendOrigin   string
	jwtSecret        string
	jwtRefreshSecret string
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	jwtS := os.Getenv("JWT_SECRET")
	jwtRS := os.Getenv("JWT_REFRESH_SECRET")
	port := os.Getenv("PORT")
	if port == "" {
		port = "443" // default HTTPS port
	}
	domain := os.Getenv("DOMAIN")
	if domain == "" {
		log.Fatal("DOMAIN env variable is required for HTTPS autocert")
	}

	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:3000"
	}
	dbLink := os.Getenv("DATABASE_LINK")
	dbConn, err := sql.Open("postgres", dbLink)
	if err != nil {
		log.Fatal("DB connection Failed")
	}
	dbQ := database.New(dbConn)
	cfg := apiCfg{
		db:               dbQ,
		port:             port,
		frontendOrigin:   frontendOrigin,
		jwtSecret:        jwtS,
		jwtRefreshSecret: jwtRS,
	}

	router := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{cfg.frontendOrigin}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"}
	config.AllowCredentials = true
	router.Use(cors.New(config))
	{
		check := router.Group("/check")
		check.GET("/", StatusCheck)
	}

	{
		auth := router.Group("/auth")
		auth.POST("/register", cfg.registerUser)
		auth.POST("/login", cfg.loginUser)
		auth.POST("/token/renew", cfg.renewToken)
	}
	{
		userAccess := router.Group("/user")
		userAccess.Use(cfg.checkAuth())
		userAccess.POST("/profile", cfg.profileInfo)
		userAccess.PATCH("/update", cfg.ProfileUpdate)
		userAccess.GET("/links", cfg.GetLinks)
		userAccess.POST("/shorten", cfg.shortenLink)
		userAccess.GET("/links/:slug", cfg.GetLink)
		userAccess.DELETE("/links/:slug", cfg.DeleteLink)
		userAccess.GET("/links/:slug/analytics", cfg.GetAnalytics)
		userAccess.PATCH("/toggle/:slug", cfg.ToggleLink)
		userAccess.PATCH("/link/utm/:slug", cfg.UpdateUTM)
		userAccess.PATCH("/link/:slug", cfg.UpdateSlug)
		userAccess.POST("/logout", cfg.LogoutUser)
	}
	{
		api := router.Group("/api")
		api.POST("/redirect/:slug", cfg.RedirectLink)
	}

	// Setup autocert manager
	certManager := autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist(domain),
		Cache:      autocert.DirCache("/certs"), // store certs inside container
	}

	// HTTP to HTTPS redirect
	go func() {
		err := http.ListenAndServe(":80", certManager.HTTPHandler(nil))
		if err != nil {
			log.Fatal("HTTP redirect server failed:", err)
		}
	}()

	// HTTPS server
	server := &http.Server{
		Addr:      ":" + port,
		Handler:   router,
		TLSConfig: certManager.TLSConfig(),
	}

	log.Println("Starting HTTPS server on port", port)
	log.Fatal(server.ListenAndServeTLS("", ""))
}
