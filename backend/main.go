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

func main() {
	port := os.Getenv("HTTP_PLATFORM_PORT")
	if port == "" {
		port = "8080"
	}

	router := mux.NewRouter()
	router.HandleFunc("/login/{username}/{password}", loginHandler).Methods(http.MethodPost)
	router.HandleFunc("/signup/{username}/{password}/{message}", signupHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/submit/{restaurant_id}/{code}/{username}/{type}", submitCodeHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/get/{restaurant_id}", getCodeHandler).Methods(http.MethodGet)
	router.HandleFunc("/leaderboard", getLeaderboardHandler).Methods(http.MethodGet)
	router.HandleFunc("/change/message/{username}/{password}/{newMessage}", changeMessageHandler).Methods(http.MethodPost)
	router.HandleFunc("/change/password/{username}/{oldPassword}/{newPassword}", changePasswordHandler).Methods(http.MethodPost)
	router.Use(mux.CORSMethodMiddleware(router))
	fmt.Println("Started listening on port " + port)
	log.Fatal(http.ListenAndServe("localhost:"+port, router))
}

func getCodeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	enableCORS(&w)
	db := openDB()
	defer db.Close()
	query := fmt.Sprintf("SELECT codes.code, codes.submission_time, users.id, users.username, users.cookie_user FROM codes "+
		"INNER JOIN users ON users.id=codes.user_id WHERE restaurant_id=\"%s\" "+
		"ORDER BY submission_time DESC LIMIT 1", vars["restaurant_id"])
	res, err := db.Query(query)
	if err != nil {
		writeError(&w, err)
		return
	}
	defer res.Close()

	var code Code
	if res.Next() {
		err := res.Scan(&code.Code, &code.DateTime, &code.UserID, &code.Username, &code.CookieUser)
		if err != nil {
			writeError(&w, err)
			return
		}
	} else {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "NO_CODES_FOUND")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusNotFound)
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(code)
	if err != nil {
		writeError(&w, err)
		return
	}
}

func submitCodeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	defer db.Close()
	enableCORS(&w)

	var login Login
	checkExistsQuery := fmt.Sprintf("SELECT id FROM users WHERE username=\"%s\"", vars["username"])
	existsRes, existsErr := db.Query(checkExistsQuery)
	if existsErr != nil {
		writeError(&w, existsErr)
		return
	}
	defer existsRes.Close()
	switch vars["type"] {
	case "id":
		if !existsRes.Next() {
			cookieUserQuery := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`, `cookie_user`) VALUES (\"%s\", \"%s\", \"%s\", \"%d\")",
				vars["username"], "N/A", "N/A", 1)
			cookieRes, cookieErr := db.Query(cookieUserQuery)
			if cookieErr != nil {
				writeError(&w, cookieErr)
				return
			}
			defer cookieRes.Close()
		}
		loginIDRes, loginIDErr := db.Query(checkExistsQuery)
		if loginIDErr != nil {
			writeError(&w, loginIDErr)
			return
		}
		defer loginIDRes.Close()
		if loginIDRes.Next() {
			err := loginIDRes.Scan(&login.ID)
			if err != nil {
				writeError(&w, err)
				return
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
				writeError(&w, err)
				return
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
		writeError(&w, resubErr)
		return
	}
	defer resubRes.Close()
	if resubRes.Next() {
		var lastCode string
		err := resubRes.Scan(&lastCode)
		if err != nil {
			writeError(&w, err)
			return
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
		writeError(&w, err)
		return
	}
	defer res.Close()
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	defer db.Close()
	enableCORS(&w)
	query := fmt.Sprintf("SELECT username FROM users WHERE username=\"%s\" AND password=\"%s\"", vars["username"], vars["password"])
	res, err := db.Query(query)
	if err != nil {
		writeError(&w, err)
		return
	}
	defer res.Close()

	if res.Next() {
		var login Login
		err := res.Scan(&login.Username)
		if err != nil {
			writeError(&w, err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(login)
		if err != nil {
			writeError(&w, err)
			return
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
	defer db.Close()
	enableCORS(&w)
	checkExistsQuery := fmt.Sprintf("SELECT * FROM users WHERE username=\"%s\"", vars["username"])
	existsRes, existsErr := db.Query(checkExistsQuery)
	if existsErr != nil {
		writeError(&w, existsErr)
		return
	}
	defer existsRes.Close()

	if existsRes.Next() {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "USERNAME_EXISTS")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if len(vars["message"]) > 36 || len(vars["password"]) > 64 || len(vars["message"]) > 256 {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "VARIABLE_TOO_LONG")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	query := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`, `cookie_user`) VALUES (\"%s\", \"%s\", \"%s\", \"%d\")",
		vars["username"], vars["password"], vars["message"], 0)
	res, err := db.Query(query)
	if err != nil {
		writeError(&w, err)
		return
	}
	defer res.Close()
}

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

func changeMessageHandler(w http.ResponseWriter, r *http.Request) {
	db := openDB()
	defer db.Close()
	vars := mux.Vars(r)
	enableCORS(&w)

	query := fmt.Sprintf("UPDATE users SET message=\"%s\" WHERE username=\"%s\" AND password=\"%s\"",
		vars["newMessage"], vars["username"], vars["password"])
	res, err := db.Exec(query)
	if err != nil {
		writeError(&w, err)
		return
	}
	affected, err := res.RowsAffected()
	if err != nil {
		writeError(&w, err)
		return
	}
	if affected <= 0 {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "INVALID_LOGIN")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

func changePasswordHandler(w http.ResponseWriter, r *http.Request) {
	db := openDB()
	defer db.Close()
	vars := mux.Vars(r)
	enableCORS(&w)

	if vars["newPassword"] == vars["oldPassword"] {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "PASSWORDS_SAME")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	query := fmt.Sprintf("UPDATE users SET password=\"%s\" WHERE username=\"%s\" AND password=\"%s\"",
		vars["newPassword"], vars["username"], vars["oldPassword"])
	res, err := db.Exec(query)
	if err != nil {
		writeError(&w, err)
		return
	}
	affected, err := res.RowsAffected()
	if err != nil {
		writeError(&w, err)
		return
	}
	if affected <= 0 {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "INVALID_LOGIN")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func writeError(w *http.ResponseWriter, err error) {
	(*w).Header().Set("Trailer", "Error")
	(*w).Header().Set("Error", err.Error())
	(*w).Header().Set("Access-Control-Expose-Headers", "Error")
	(*w).WriteHeader(http.StatusInternalServerError)
}

func openDB() *sql.DB {
	port := "3306"
	database := "grubhub_codes"
	username := os.Getenv("GH_DB_USERNAME")
	password := os.Getenv("GH_DB_PASSWORD")
	hostname := os.Getenv("GH_DB_HOSTNAME")
	useTLS := os.Getenv("GH_DB_USETLS")

	connection := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&tls=%s", username, password, hostname, port, database, useTLS)
	db, err := sql.Open("mysql", connection)
	if err != nil {
		log.Fatal(err)
	}
	return db
}
