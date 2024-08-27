package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func getLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	db := openDB()
	defer db.Close()
	enableCORS(&w)
	const MaxResult = 5
	recentQuery := fmt.Sprintf("SELECT id, username, message, recent_submissions, cookie_user FROM users ORDER BY recent_submissions DESC LIMIT %d", MaxResult)
	recentRes, recentErr := db.Query(recentQuery)
	if recentErr != nil {
		writeError(&w, recentErr)
		return
	}
	defer recentRes.Close()

	var leaderboard Leaderboard
	for recentRes.Next() {
		var user Login
		err := recentRes.Scan(&user.ID, &user.Username, &user.Message, &user.RecentSubmissions, &user.CookieUser)
		if err != nil {
			writeError(&w, err)
			return
		}
		leaderboard.Recent = append(leaderboard.Recent, user)
	}

	totalQuery := fmt.Sprintf("SELECT id, username, message, total_submissions, cookie_user FROM users ORDER BY total_submissions DESC LIMIT %d", MaxResult)
	totalRes, totalErr := db.Query(totalQuery)
	if totalErr != nil {
		writeError(&w, totalErr)
		return
	}
	defer totalRes.Close()

	for totalRes.Next() {
		var user Login
		err := totalRes.Scan(&user.ID, &user.Username, &user.Message, &user.TotalSubmissions, &user.CookieUser)
		if err != nil {
			writeError(&w, err)
			return
		}
		leaderboard.Total = append(leaderboard.Total, user)
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(leaderboard)
	if err != nil {
		writeError(&w, err)
		return
	}
}
