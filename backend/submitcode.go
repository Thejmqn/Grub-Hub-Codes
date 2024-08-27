package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

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
