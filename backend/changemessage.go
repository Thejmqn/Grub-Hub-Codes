package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

func changeMessageHandler(w http.ResponseWriter, r *http.Request) {
	db := openDB()
	defer db.Close()
	vars := mux.Vars(r)
	enableCORS(&w)

	hash := hashString(vars["password"])
	query := fmt.Sprintf("UPDATE users SET message=\"%s\" WHERE username=\"%s\" AND password=\"%s\"",
		vars["newMessage"], vars["username"], hash)
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
