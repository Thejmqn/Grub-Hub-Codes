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

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/codes/{restaurant}", codeHandler).Methods(http.MethodGet)
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
