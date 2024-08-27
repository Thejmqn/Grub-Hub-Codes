package main

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("HTTP_PLATFORM_PORT")
	if port == "" {
		port = "8080"
	}

	router := mux.NewRouter()
	router.HandleFunc("/login/{username}/{password}", loginHandler).Methods(http.MethodPost)
	router.HandleFunc("/signup/{username}/{password}/{message}", signupHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/submit/{restaurant_id}/{code}/{username}/{type}", submitCodeHandler).Methods(http.MethodPost)
	router.HandleFunc("/codes/get/{restaurant_id}", getCodeHandler).Methods(http.MethodGet)
	router.HandleFunc("/leaderboard", getLeaderboardHandler).Methods(http.MethodGet)
	router.HandleFunc("/change/message/{username}/{password}/{newMessage}", changeMessageHandler).Methods(http.MethodPost)
	router.HandleFunc("/change/password/{username}/{oldPassword}/{newPassword}", changePasswordHandler).Methods(http.MethodPost)
	router.Use(mux.CORSMethodMiddleware(router))
	fmt.Println("Started listening on port " + port)
	log.Fatal(http.ListenAndServe("localhost:"+port, router))
}
