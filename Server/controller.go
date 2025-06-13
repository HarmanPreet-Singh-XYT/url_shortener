package main

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/HarmanPreet-Singh-XYT/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func StatusCheck(c *gin.Context) {
	c.JSON(http.StatusOK, "All Good")
}
func (cfg *apiCfg) registerUser(c *gin.Context) {
	var data RegisterReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, gin.Error{Err: err})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	userCreation, err := cfg.db.CreateUser(c, database.CreateUserParams{
		Name:     data.Name,
		Email:    data.Email,
		Password: string(hashedPassword),
	})
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			if pqErr.Code == "23505" { // Unique violation
				c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
				return
			}
		}
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	refreshToken, err := createToken(userCreation.ID, time.Duration(time.Hour*24*7), cfg.jwtRefreshSecret)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	errToken := cfg.db.CreateToken(c, database.CreateTokenParams{
		UserID:       userCreation.ID,
		RefreshToken: refreshToken,
	})
	if errToken != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	accessToken, err := createToken(userCreation.ID, time.Duration(time.Minute*15), cfg.jwtSecret)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	c.JSON(http.StatusOK, AuthRes{
		RefreshToken: refreshToken,
		AccessToken:  accessToken,
		Name:         userCreation.Name,
		Email:        userCreation.Email,
		Id:           userCreation.ID,
	})
}
func (cfg *apiCfg) loginUser(c *gin.Context) {
	var data LoginReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, gin.Error{Err: err})
		return
	}
	userInfo, err := cfg.db.RetrieveUserByEmail(c, data.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		// Some other DB error
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	errPass := bcrypt.CompareHashAndPassword([]byte(userInfo.Password), []byte(data.Password))
	if errPass != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Password does not match"})
		return
	}
	refreshToken, err := createToken(userInfo.ID, time.Duration(time.Hour*24*7), cfg.jwtRefreshSecret)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	errToken := cfg.db.CreateToken(c, database.CreateTokenParams{
		UserID:       userInfo.ID,
		RefreshToken: refreshToken,
	})
	if errToken != nil {
		var pqErr *pq.Error
		if errors.As(errToken, &pqErr) {
			if pqErr.Code == "23505" { // Unique violation
				// If no token found, create one
				errToken = cfg.db.UpdateTokenByUserId(c, database.UpdateTokenByUserIdParams{
					UserID:       userInfo.ID,
					RefreshToken: refreshToken,
				})
				if errToken != nil {
					c.AbortWithError(http.StatusBadRequest, errToken)
					return
				}
			}
		} else {
			c.AbortWithError(http.StatusInternalServerError, errToken)
			return
		}
	}
	accessToken, err := createToken(userInfo.ID, time.Duration(time.Minute*15), cfg.jwtSecret)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	c.JSON(http.StatusOK, AuthRes{
		RefreshToken: refreshToken,
		AccessToken:  accessToken,
		Name:         userInfo.Name,
		Email:        userInfo.Email,
		Id:           userInfo.ID,
	})
}
func (cfg *apiCfg) renewToken(c *gin.Context) {
	var data TokenReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	tokDB, err := cfg.db.RetrieveTokenByToken(c, data.RefreshToken)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	token, err := jwt.Parse(tokDB.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(cfg.jwtRefreshSecret), nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token subject"})
		return
	}

	id, err := uuid.Parse(sub)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token parse failed"})
		return
	}

	user, err := cfg.db.RetrieveUserById(c, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	refreshToken, err := createToken(user.ID, 7*24*time.Hour, cfg.jwtRefreshSecret)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := cfg.db.UpdateTokenByUserId(c, database.UpdateTokenByUserIdParams{
		UserID:       user.ID,
		RefreshToken: refreshToken,
	}); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	accessToken, err := createToken(user.ID, time.Minute*15, cfg.jwtSecret)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, AuthTokenRes{
		RefreshToken: refreshToken,
		AccessToken:  accessToken,
	})
}

func (cfg *apiCfg) profileInfo(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	c.JSON(http.StatusOK, UserInfoReq{
		Id:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	})
}

func (cfg *apiCfg) GetLinks(c *gin.Context) {
	// Debug: Check if user authentication works
	user := sortMiddlewareAuth(c)

	var outputData []Link

	// Retrieve short links for the user
	data, err := cfg.db.RetrieveShortLinkByUserId(c, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve links"})
		return
	}

	// If no links found, return empty array instead of null
	if len(data) == 0 {
		c.JSON(http.StatusOK, []Link{})
		return
	}

	// Process each link
	for _, val := range data {

		totalClicks, err := cfg.db.CountTotalClickByShortLinkId(c, val.ID)
		if err != nil {
			fmt.Printf("Debug: Error counting total clicks: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count total clicks"})
			return
		}

		uniqueClicks, err := cfg.db.CountUniqueClickByShortLinkId(c, val.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count unique clicks"})
			return
		}

		outputData = append(outputData, Link{
			Slug:         val.Slug,
			OriginalURL:  val.OriginalUrl,
			CreatedAt:    val.CreatedAt.String(),
			TotalClicks:  int(totalClicks),
			UniqueClicks: int(uniqueClicks),
			UTMSource:    val.UtmSource,
			UTMMedium:    val.UtmMedium,
			UTMCampaign:  val.UtmCampaign,
			IsActive:     val.IsActive.Bool,
			UpdatedAt:    val.UpdatedAt.Time.String(),
			ShortURL:     cfg.frontendOrigin + val.Slug,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": outputData})
}

func (cfg *apiCfg) shortenLink(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	var data ShortenReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	if data.Slug == "" {
		data.Slug = GenerateRandomString(6)
	}
	err := cfg.db.CreateShortLink(c, database.CreateShortLinkParams{
		UserID:      user.ID,
		Slug:        data.Slug,
		OriginalUrl: data.URL,
		UtmSource:   data.UTMSource,
		UtmMedium:   data.UTMMedium,
		UtmCampaign: data.UTMCampaign,
	})
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			if pqErr.Code == "23505" { // Unique violation
				c.JSON(http.StatusConflict, gin.H{"error": "slug already exists"})
				return
			}
		}
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"short_url": cfg.frontendOrigin + data.Slug})
}
func (cfg *apiCfg) GetLink(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	slugData, err := cfg.db.RetrieveShortLinkBySlugNUserId(c, database.RetrieveShortLinkBySlugNUserIdParams{
		UserID: user.ID,
		Slug:   slug,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		// Some other DB error
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, LinkReq{
		URL:         slugData.OriginalUrl,
		UTMSource:   slugData.UtmSource,
		UTMMedium:   slugData.UtmMedium,
		UTMCampaign: slugData.UtmCampaign,
		Slug:        slugData.Slug,
		CreatedAt:   slugData.CreatedAt.String(),
	})
}
func (cfg *apiCfg) DeleteLink(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	err := cfg.db.DeleteShortLinkBySlugNUserId(c, database.DeleteShortLinkBySlugNUserIdParams{
		UserID: user.ID,
		Slug:   slug,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		// Some other DB error
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, SuccessRes{Success: true})
}

func (cfg *apiCfg) GetAnalytics(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	slugData, err := cfg.db.RetrieveShortLinkBySlugNUserId(c, database.RetrieveShortLinkBySlugNUserIdParams{
		UserID: user.ID,
		Slug:   slug,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	data := Analytics{
		TotalClicks:  0,
		UniqueClicks: 0,
		ByCountry:    map[string]int{},
		ByReferrer:   map[string]int{},
		UTMBreakdown: UTMB{
			UTMSource:   map[string]int{},
			UTMMedium:   map[string]int{},
			UTMCampaign: map[string]int{},
		},
		ClicksByDate: map[string]int{},
		DeviceSummary: DeviceAnalytics{
			DeviceType:       map[string]int{},
			Platform:         map[string]int{},
			Language:         map[string]int{},
			ScreenResolution: map[string]int{},
			Timezone:         map[string]int{},
			UserAgents:       map[string]int{},
		},
	}

	analyticsData, err := cfg.db.AnalyticsRetrieval(c, slugData.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusOK, gin.H{"data": data})
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	sortAnalyticsData(&data, analyticsData)

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (cfg *apiCfg) ProfileUpdate(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	var data ProfileUpdateReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, gin.Error{Err: err})
		return
	}
	if data.ResourceType == "email" {
		err := cfg.db.UpdateUserEmail(c, database.UpdateUserEmailParams{ID: user.ID, Email: data.Value})
		if err != nil {
			var pqErr *pq.Error
			if errors.As(err, &pqErr) {
				if pqErr.Code == "23505" { // Unique violation
					c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
					return
				}
			}
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
	} else if data.ResourceType == "name" {
		err := cfg.db.UpdateUserName(c, database.UpdateUserNameParams{
			ID:   user.ID,
			Name: data.Value,
		})
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	} else if data.ResourceType == "password" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Value), bcrypt.DefaultCost)
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		errDB := cfg.db.UpdateUserPassword(c, database.UpdateUserPasswordParams{ID: user.ID, Password: string(hashedPassword)})
		if errDB != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
	}

	c.JSON(http.StatusOK, SuccessRes{Success: true})
}
func (cfg *apiCfg) ToggleLink(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	err := cfg.db.ToggleShortLink(c, database.ToggleShortLinkParams{
		Slug:   slug,
		UserID: user.ID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		// Some other DB error
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, SuccessRes{Success: true})
}
func (cfg *apiCfg) UpdateUTM(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	var data UTMReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, gin.Error{Err: err})
		return
	}
	err := cfg.db.UpdateShortLinkUTM(c, database.UpdateShortLinkUTMParams{
		Slug:        slug,
		UtmSource:   data.UTMSource,
		UtmMedium:   data.UTMMedium,
		UtmCampaign: data.UTMCampaign,
		UserID:      user.ID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		// Some other DB error
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, SuccessRes{Success: true})
}
func (cfg *apiCfg) UpdateSlug(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	var data SlugReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, gin.Error{Err: err})
		return
	}
	err := cfg.db.UpdateShortLinkSlug(c, database.UpdateShortLinkSlugParams{Slug: slug, UserID: user.ID})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		var pqErr *pq.Error
		if errors.As(err, &pqErr) {
			if pqErr.Code == "23505" { // Unique violation
				c.JSON(http.StatusConflict, gin.H{"error": "link already exists"})
				return
			}
		}
		// Some other DB error
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, SuccessRes{Success: true})
}
func (cfg *apiCfg) LogoutUser(c *gin.Context) {
	user := sortMiddlewareAuth(c)
	err := cfg.db.DeleteToken(c, user.ID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, SuccessRes{Success: true})
}
func (cfg *apiCfg) RedirectLink(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	var data RedirectReq
	if err := c.ShouldBindJSON(&data); err != nil {
		c.AbortWithError(http.StatusBadRequest, gin.Error{Err: err})
		return
	}
	linkData, err := cfg.db.RetrieveShortLinkBySlug(c, slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found
			c.JSON(http.StatusNotFound, gin.H{"error": "link not found"})
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	if !linkData.IsActive.Bool {
		c.JSON(http.StatusMethodNotAllowed, RedirectResponse{OriginalURL: ""})
		return
	}
	c.JSON(http.StatusOK, RedirectResponse{OriginalURL: linkData.OriginalUrl})
	go cfg.SaveAnalytics(c, linkData.ID, data)
}
