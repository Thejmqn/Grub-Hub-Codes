package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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
	port := os.Getenv("HTTP_PLATFORM_PORT")
	if port == "" {
		port = "8080"
	}

	router := mux.NewRouter()
	router.HandleFunc("/login/{username}/{password}", loginHandler).Methods(http.MethodPost)
	router.HandleFunc("/signup/{username}/{password}", signupHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/submit/{restaurant_id}/{code}/{username}/{type}", submitCodeHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/get/{restaurant_id}", getCodeHandler).Methods(http.MethodGet)
	router.HandleFunc("/leaderboard", getLeaderboardHandler).Methods(http.MethodGet)
	router.Use(mux.CORSMethodMiddleware(router))
	fmt.Println("Started listening on port " + port)
	log.Fatal(http.ListenAndServe("localhost:"+port, router))
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
	enableCORS(&w)

	var login Login
	checkExistsQuery := fmt.Sprintf("SELECT id FROM users WHERE username=\"%s\"", vars["username"])
	existsRes, existsErr := db.Query(checkExistsQuery)
	if existsErr != nil {
		log.Fatal(existsErr)
	}
	defer existsRes.Close()
	switch vars["type"] {
	case "id":
		if !existsRes.Next() {
			cookieUserQuery := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`, `cookie_user`) VALUES (\"%s\", \"%s\", \"%s\", \"%d\")",
				vars["username"], "N/A", "N/A", 1)
			cookieRes, cookieErr := db.Query(cookieUserQuery)
			if cookieErr != nil {
				log.Fatal(cookieErr)
			}
			defer cookieRes.Close()
		}
		loginIDRes, loginIDErr := db.Query(checkExistsQuery)
		if loginIDErr != nil {
			log.Fatal(loginIDErr)
		}
		defer loginIDRes.Close()
		if loginIDRes.Next() {
			err := loginIDRes.Scan(&login.ID)
			if err != nil {
				log.Fatal(err)
			}
		} else {
			w.Header().Set("Trailer", "Type")
			w.Header().Set("Type", "INVALID_USERNAME")
			w.Header().Set("Access-Control-Expose-Headers", "Type")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	case "login":
		if !existsRes.Next() {
			w.Header().Set("Trailer", "Type")
			w.Header().Set("Type", "INVALID_USERNAME")
			w.Header().Set("Access-Control-Expose-Headers", "Type")
			w.WriteHeader(http.StatusBadRequest)
			return
		} else {
			err := existsRes.Scan(&login.ID)
			if err != nil {
				log.Fatal(err)
			}
		}
	default:
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "INVALID_LOGIN_TYPE")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
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

	checkResubmissionQuery := fmt.Sprintf("SELECT code FROM codes WHERE restaurant_id=\"%s\" ORDER BY ID DESC LIMIT 1", vars["restaurant_id"])
	resubRes, resubErr := db.Query(checkResubmissionQuery)
	if resubErr != nil {
		log.Fatal(resubErr)
	}
	defer resubRes.Close()
	if resubRes.Next() {
		var lastCode string
		err := resubRes.Scan(&lastCode)
		if err != nil {
			log.Fatal(err)
		}
		if lastCode == code {
			w.Header().Set("Trailer", "Type")
			w.Header().Set("Type", "ILLEGAL_RESUBMISSION")
			w.Header().Set("Access-Control-Expose-Headers", "Type")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	query := fmt.Sprintf("INSERT INTO codes (`code`, `user_id`, `restaurant_id`, `submission_time`) VALUES (\"%s\", \"%d\", \"%s\", NOW())", code, login.ID, vars["restaurant_id"])
	res, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
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
	query := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`, `cookie_user`) VALUES (\"%s\", \"%s\", \"%s\", \"%d\")",
		vars["username"], vars["password"], "Message not set.", 0)
	res, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Close()
}

func getLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	db := openDB()
	enableCORS(&w)
	const MaxResult = 5
	recentQuery := fmt.Sprintf("SELECT id, username, message, recent_submissions FROM users ORDER BY recent_submissions DESC LIMIT %d", MaxResult)
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

	totalQuery := fmt.Sprintf("SELECT id, username, message, total_submissions FROM users ORDER BY total_submissions DESC LIMIT %d", MaxResult)
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
	const (
		Hostname = "mysql-ghcodes.mysql.database.azure.com"
		Username = "jmqn"
		Password = "4Videos123$"
		Port     = "3306"
		Database = "grubhub_codes"
	)
	connection := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&tls=true", Username, Password, Hostname, Port, Database)
	db, err := sql.Open("mysql", connection)
	if err != nil {
		log.Fatal(err)
	}
	return db
}
