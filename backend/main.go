package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

type Code struct {
	code         int
	userID       int
	restaurantID int
	dateTime     []uint8
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/codes/{restaurant}", codeHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func codeHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	w.WriteHeader(http.StatusOK)
	db := openDB()
	res, err := db.Query("SELECT * from codes")
	defer res.Close()
	if err != nil {
		log.Fatal(err)
	}

	for res.Next() {
		var code Code
		err := res.Scan(&code.code, &code.userID, &code.restaurantID, &code.dateTime)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(code)
	}
	fmt.Println(vars["restaurant"])
}

func openDB() *sql.DB {
	db, err := sql.Open("mysql", "root:SQLpass@tcp(127.0.0.1:3306)/grubhub_codes")
	if err != nil {
		log.Fatal(err)
	}
	return db
}
