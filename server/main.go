package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
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
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.String(200, "We got Gin")
	})

	// Configure websocket route
	r.GET("/ws", func(c *gin.Context) {
		handleConnections(c.Writer, c.Request)
	})

	// Start listening for incoming chat messages
	go handleMessages()

	r.Run("localhost:8000")
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
