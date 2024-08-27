package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

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

	newHash := hashString(vars["newPassword"])
	oldHash := hashString(vars["oldPassword"])
	query := fmt.Sprintf("UPDATE users SET password=\"%s\" WHERE username=\"%s\" AND password=\"%s\"",
		newHash, vars["username"], oldHash)
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
