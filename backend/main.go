package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

type Code struct {
	ID           int       `json:"id"`
	Code         int       `json:"code"`
	UserID       int       `json:"userID"`
	RestaurantID int       `json:"restaurantID"`
	DateTime     time.Time `json:"dateTime"`
}

type Login struct {
	ID                int    `json:"id"`
	Username          string `json:"username"`
	Password          string `json:"password"`
	Message           string `json:"message"`
	TotalSubmissions  int    `json:"totalSubmissions"`
	RecentSubmissions int    `json:"recentSubmissions"`
}

type Leaderboard struct {
	Recent []Login `json:"recent"`
	Total  []Login `json:"total"`
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/login/{username}/{password}", loginHandler).Methods(http.MethodPost)
	router.HandleFunc("/signup/{username}/{password}", signupHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/submit/{restaurant_id}/{code}/{username}", submitCodeHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/get/{restaurant_id}", getCodeHandler).Methods(http.MethodGet)
	router.HandleFunc("/leaderboard", getLeaderboardHandler).Methods(http.MethodGet)
	router.Use(mux.CORSMethodMiddleware(router))
	fmt.Println("Started listening on port 8080")
	log.Fatal(http.ListenAndServe("localhost:8080", router))
}

func getCodeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	query := fmt.Sprintf("SELECT * FROM codes WHERE restaurant_id=\"%s\" ORDER BY ID DESC LIMIT 1", vars["restaurant_id"])
	res, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Close()
	enableCORS(&w)

	var code Code
	if res.Next() {
		err := res.Scan(&code.ID, &code.Code, &code.UserID, &code.RestaurantID, &code.DateTime)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "NO_CODES_FOUND")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusNotFound)
	}

	w.Header().Set("Content-Type", "application/json")
	encode := json.NewEncoder(w).Encode(code)
	if encode != nil {
		log.Fatal(encode)
	}
}

func submitCodeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	checkExistsQuery := fmt.Sprintf("SELECT * FROM users WHERE username=\"%s\"", vars["username"])
	existsRes, existsErr := db.Query(checkExistsQuery)
	if existsErr != nil {
		log.Fatal(existsErr)
	}
	defer existsRes.Close()
	enableCORS(&w)

	var login Login
	if !existsRes.Next() {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "INVALID_USERNAME")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	} else {
		err := existsRes.Scan(&login.ID, &login.Username, &login.Password, &login.Message, &login.TotalSubmissions, &login.RecentSubmissions)
		if err != nil {
			log.Fatal(err)
		}
	}

	code := vars["code"]
	_, NaN := strconv.Atoi(code)
	if len(code) != 4 || NaN != nil {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "INVALID_CODE")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	query := fmt.Sprintf("INSERT INTO codes (`code`, `user_id`, `restaurant_id`, `submission_time`) VALUES (\"%s\", \"%d\", \"%s\", NOW())", code, login.ID, vars["restaurant_id"])
	res, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
	}
	defer res.Close()
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	query := fmt.Sprintf("SELECT * FROM users WHERE username=\"%s\" AND password=\"%s\"", vars["username"], vars["password"])
	res, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Close()

	enableCORS(&w)
	if res.Next() {
		var login Login
		err := res.Scan(&login.ID, &login.Username, &login.Password, &login.Message, &login.TotalSubmissions, &login.RecentSubmissions)
		if err != nil {
			log.Fatal(err)
		}

		w.Header().Set("Content-Type", "application/json")
		encode := json.NewEncoder(w).Encode(login)
		if encode != nil {
			log.Fatal(encode)
		}
	} else {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "INVALID_LOGIN")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
	}
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	checkExistsQuery := fmt.Sprintf("SELECT * FROM users WHERE username=\"%s\"", vars["username"])
	existsRes, existsErr := db.Query(checkExistsQuery)
	if existsErr != nil {
		log.Fatal(existsErr)
	}
	defer existsRes.Close()

	enableCORS(&w)
	if existsRes.Next() {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "USERNAME_EXISTS")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	query := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`) VALUES (\"%s\", \"%s\", \"%s\")", vars["username"], vars["password"], "Message not set.")
	res, err := db.Query(query)
	if err != nil {
		fmt.Println(err)
	}
	defer res.Close()
}

func getLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	db := openDB()
	enableCORS(&w)
	const MAX_RESULT = 5
	recentQuery := fmt.Sprintf("SELECT id, username, message, recent_submissions FROM users ORDER BY recent_submissions DESC LIMIT %d", MAX_RESULT)
	recentRes, recentErr := db.Query(recentQuery)
	if recentErr != nil {
		log.Fatal(recentErr)
	}
	defer recentRes.Close()

	var leaderboard Leaderboard
	for recentRes.Next() {
		var user Login
		err := recentRes.Scan(&user.ID, &user.Username, &user.Message, &user.RecentSubmissions)
		if err != nil {
			log.Fatal(err)
		}
		leaderboard.Recent = append(leaderboard.Recent, user)
	}

	totalQuery := fmt.Sprintf("SELECT id, username, message, total_submissions FROM users ORDER BY total_submissions DESC LIMIT %d", MAX_RESULT)
	totalRes, totalErr := db.Query(totalQuery)
	if totalErr != nil {
		log.Fatal(recentErr)
	}
	defer totalRes.Close()

	for totalRes.Next() {
		var user Login
		err := totalRes.Scan(&user.ID, &user.Username, &user.Message, &user.TotalSubmissions)
		if err != nil {
			log.Fatal(err)
		}
		leaderboard.Total = append(leaderboard.Total, user)
	}

	w.Header().Set("Content-Type", "application/json")
	encode := json.NewEncoder(w).Encode(leaderboard)
	if encode != nil {
		log.Fatal(encode)
	}
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func openDB() *sql.DB {
	db, err := sql.Open("mysql", "root:SQLpass@tcp(127.0.0.1:3306)/grubhub_codes?parseTime=true")
	if err != nil {
		log.Fatal(err)
	}
	return db
}
