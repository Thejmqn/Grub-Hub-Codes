package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	db := openDB()
	defer db.Close()
	enableCORS(&w)

	hash := hashString(vars["password"])
	query := fmt.Sprintf("SELECT username FROM users WHERE username=\"%s\" AND password=\"%s\"", vars["username"], hash)
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
