package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

//var clients = make(map[*websocket.Conn]bool) // connected clients
var broadcast = make(chan Message) // broadcast channels
type clients struct {
	client *websocket.Conn
}

var channel = make(map[int]clients)
var countChannel int = 0

var upgrader = websocket.Upgrader{}

type Message struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Message  string `json:"message"`
}

func main() {
	// Create a simple file server
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start listening for incoming chat messages
	go handleMessages()

	log.Println("http server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	/*log.Println("http server started on :8443")
	certPath := "server.pem"
	keyPath := "server.key"
	err := http.ListenAndServeTLS(":8443", certPath, keyPath, nil)*/
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	// Register our new client
	//clients[ws] = true
	var client clients
	client.client = ws
	channel[countChannel] = client
	countChannel++
	fmt.Println(channel)

	for {
		var msg Message
		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			//delete(clients, ws)
			break
		}
		// Send the newly received message to the broadcast channel
		broadcast <- msg

	}
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast
		// Send it out to every client that is currently connected
		/*for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}*/
		for _, client := range channel {
			err := client.client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.client.Close()
				//delete(clients, client)
			}
		}
	}
}
