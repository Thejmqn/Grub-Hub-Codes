package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

type Code struct {
	ID           int     `json:"id"`
	Code         int     `json:"code"`
	UserID       int     `json:"userID"`
	RestaurantID int     `json:"restaurantID"`
	DateTime     []uint8 `json:"dateTime"`
}

type Login struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Message  string `json:"message"`
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/codes/{restaurant}", codeHandler).Methods(http.MethodGet)
	router.HandleFunc("/login/{username}/{password}", loginHandler).Methods(http.MethodPost)
	router.HandleFunc("/signup/{username}/{password}", signupHandler).Methods(http.MethodPost)
	router.Use(mux.CORSMethodMiddleware(router))
	log.Fatal(http.ListenAndServe(":8080", router))
}

func codeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	query := fmt.Sprintf("SELECT * FROM codes WHERE restauraunt_id=%s", vars["restaurant"])
	res, err := db.Query(query)
	defer res.Close()
	if err != nil {
		log.Fatal(err)
	}

	var codes []Code
	for res.Next() {
		var code Code
		err := res.Scan(&code.ID, &code.Code, &code.UserID, &code.RestaurantID, &code.DateTime)
		if err != nil {
			log.Fatal(err)
		}
		codes = append(codes, code)
	}
	fmt.Println(codes)

	enableCORS(&w)
	w.Header().Set("Content-Type", "application/json")
	encode := json.NewEncoder(w).Encode(codes)
	if encode != nil {
		log.Fatal(encode)
	}
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	query := fmt.Sprintf("SELECT * FROM users WHERE username=\"%s\" AND password=username=\"%s\"", vars["username"], vars["password"])
	res, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}

	enableCORS(&w)
	if res.Next() {
		var login Login
		err := res.Scan(&login.ID, &login.Username, &login.Password, &login.Message)
		if err != nil {
			log.Fatal(err)
		}

		w.Header().Set("Content-Type", "application/json")
		encode := json.NewEncoder(w).Encode(login)
		if encode != nil {
			log.Fatal(encode)
		}
		w.WriteHeader(http.StatusOK)
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
	defer existsRes.Close()
	if existsErr != nil {
		log.Fatal(existsErr)
	}

	enableCORS(&w)
	if existsRes.Next() {
		w.Header().Set("Trailer", "Type")
		w.Header().Set("Type", "USERNAME_EXISTS")
		w.Header().Set("Access-Control-Expose-Headers", "Type")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	query := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`) VALUES (\"%s\", \"%s\", \"%s\")", vars["username"], vars["password"], "Message not set.")
	fmt.Println(query)
	res, err := db.Query(query)
	defer res.Close()
	if err != nil {
		fmt.Println(err)
	}
	w.WriteHeader(http.StatusOK)
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func openDB() *sql.DB {
	db, err := sql.Open("mysql", "root:SQLpass@tcp(127.0.0.1:3306)/grubhub_codes")
	if err != nil {
		log.Fatal(err)
	}
	return db
}
