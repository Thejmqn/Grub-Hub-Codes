package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

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
