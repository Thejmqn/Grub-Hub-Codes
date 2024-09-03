package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
)

func enableCORS(w *http.ResponseWriter) {
	const host = "https://www.uvacodes.com"
	(*w).Header().Set("Access-Control-Allow-Origin", host)
}

func writeError(w *http.ResponseWriter, err error) {
	(*w).Header().Set("Trailer", "Error")
	(*w).Header().Set("Error", err.Error())
	(*w).Header().Set("Access-Control-Expose-Headers", "Error")
	(*w).WriteHeader(http.StatusInternalServerError)
}

func hashString(raw string) string {
	salt := raw + os.Getenv("GH_SALT")
	hash := sha256.Sum256([]byte(salt + raw))
	return hex.EncodeToString(hash[:])
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
