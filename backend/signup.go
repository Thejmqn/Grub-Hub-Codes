package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

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

	hash := hashString(vars["password"])
	fmt.Println(hash)
	query := fmt.Sprintf("INSERT INTO users (`username`, `password`, `message`, `cookie_user`) VALUES (\"%s\", \"%s\", \"%s\", \"%d\")",
		vars["username"], hash, vars["message"], 0)
	res, err := db.Query(query)
	if err != nil {
		writeError(&w, err)
		return
	}
	defer res.Close()
}
