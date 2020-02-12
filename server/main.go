package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var broadcast = make(chan Message) // broadcast channels

var channels = make(map[string][]*websocket.Conn)

var upgrader = websocket.Upgrader{}

type Message struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Message  string `json:"message"`
	Channel  string `json:"channel"`
}

func main() {
	r := gin.Default()

	r.Static("/push", "../public")

	r.GET("/", func(c *gin.Context) {
		c.String(200, "It's working")
	})

	r.GET("/channels", func(c *gin.Context) {
		var channelsNames []string
		for k := range channels {
			channelsNames = append(channelsNames, k)
		}
		c.JSON(http.StatusOK, gin.H{"channels": channelsNames})
	})

	r.POST("/channels", func(c *gin.Context) {
		type RequestBody struct {
			Name string `json:"name" binding:"required"`
		}

		var requestBody RequestBody

		if err := c.BindJSON(&requestBody); err != nil {
			c.AbortWithStatus(400)
			return
		}

		channels[requestBody.Name] = append(channels[requestBody.Name], nil)

		c.JSON(http.StatusCreated, gin.H{
			"status":  http.StatusCreated,
			"message": "Created successfully!",
		})
	})

	// Configure websocket route
	r.GET("/ws/:id", func(c *gin.Context) {
		handleConnections(c.Writer, c.Request, c.Param("id"))
	})

	// Start listening for incoming chat messages
	go handleMessages()

	//r.Run("localhost:8000")
	r.RunTLS(":8443", "server.pem", "server.key")
}

func handleConnections(w http.ResponseWriter, r *http.Request, c string) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	// Register our new client
	channels[c] = append(channels[c], ws)
	fmt.Println(channels)

	for {
		var msg Message
		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		fmt.Println(msg)
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
		for k, client := range channels[msg.Channel] {
			if client != nil {
				err := client.WriteJSON(msg)
				if err != nil {
					log.Printf("error: %v", err)
					client.Close()
					channels[msg.Channel][k] = nil
				}
			}
		}

		for k, client := range channels[msg.Channel] {
			if client == nil && k < len(channels[msg.Channel]) {
				channels[msg.Channel][k] = channels[msg.Channel][len(channels[msg.Channel])-1]
				channels[msg.Channel][len(channels[msg.Channel])-1] = nil
				channels[msg.Channel] = channels[msg.Channel][:len(channels[msg.Channel])-1]
			}
		}
	}
}
