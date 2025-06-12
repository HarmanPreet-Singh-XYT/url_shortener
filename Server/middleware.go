package main

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func (cfg *apiCfg) checkAuth() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is missing"})
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		authToken := strings.Split(authHeader, " ")
		if len(authToken) != 2 || authToken[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenString := authToken[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(cfg.jwtSecret), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token expired"})
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		idToken, err := claims.GetSubject()
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token retrieval failed"})
			c.AbortWithStatus(http.StatusUnauthorized)
		}
		id, err := uuid.Parse(idToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token parse failed"})
			c.AbortWithStatus(http.StatusUnauthorized)
		}
		user, err := cfg.db.RetrieveUserById(c, id)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				// User not found
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
				return
			}
			// Some other DB error
			c.AbortWithError(http.StatusInternalServerError, err)
		}

		c.Set("currentUser", user)

		c.Next()
	}
}
