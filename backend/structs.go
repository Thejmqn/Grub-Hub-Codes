package main

import "time"

type Code struct {
	ID           int       `json:"id"`
	Code         int       `json:"code"`
	UserID       int       `json:"userID"`
	RestaurantID int       `json:"restaurantID"`
	DateTime     time.Time `json:"dateTime"`
	Username     string    `json:"username"`
	CookieUser   bool      `json:"cookieUser"`
}

type Login struct {
	ID                int    `json:"id"`
	Username          string `json:"username"`
	Password          string `json:"password"`
	Message           string `json:"message"`
	TotalSubmissions  int    `json:"totalSubmissions"`
	RecentSubmissions int    `json:"recentSubmissions"`
	Blocked           bool   `json:"blocked"`
	CookieUser        bool   `json:"cookieUser"`
}

type Leaderboard struct {
	Recent []Login `json:"recent"`
	Total  []Login `json:"total"`
}
