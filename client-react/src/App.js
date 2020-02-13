import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, TextField, Button } from '@material-ui/core';
import * as serviceWorker from './serviceWorker';
import ChatRooms from './components/ChatRooms'

const pushNotificationSupported = serviceWorker.isPushNotificationSupported();

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  form: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  button: {
    margin: theme.spacing(1),
  },
}));

function App() {
  const [clients, setClients] = useState({})
  const [client, setClient] = useState()
  const [messageError, setMessageError] = useState()
  const [chatRooms, setChatRooms] = useState([])
  const [authorization, setAuthorization] = useState({is: true, message: ""})

  useEffect(() => {
    getChannels()
  }, [])
  /*serviceWorker.askUserPermission().then(consent => {console.log(
     "Permitido", consent
  )})
  serviceWorker.createNotificationSubscription()*/

  const classes = useStyles();

  axios.defaults.baseURL = "http://localhost:8000";
  axios.defaults.headers.common = {
    "Content-Type": "application/json",
  };

  const send = client => () => {
    if(clients[client] != null) {
      clients[client].send(
        JSON.stringify({
          email: "react@react.com",
          username: "react",
          message: document.getElementById("message").value,
          channel: client
      }))
      setMessageError()
    } else {
      setMessageError("No hay canal suscrito")
    }
  }

  const newChannel = () => {
    axios.post("/channels", JSON.stringify({name: document.getElementById("name").value})).then(response => {
      if(response.status === 201){
        document.getElementById("name").value = ""
        getChannels()
      }
    })
  }

  const getChannels = () => {
    axios.get("/channels").then(response => {
      setChatRooms(response.data.channels)
    })
  }

  const connetServer =  (channel, close) => {
    if (clients[channel] == null) {
      setClients(prevState => {
        if (prevState[channel] == null) {
          let newConnection =  new W3CWebSocket('ws://localhost:8000/ws/'+channel);

          newConnection.onopen = () => {
            console.log('WebSocket Client Connected');
          };
          newConnection.onmessage = (message) => {
            console.log(message.data);
            const data = JSON.parse(message.data)
            serviceWorker.sendNotification(data.message)
          };
          newConnection.onclose = () => {
            console.log("Closed!")
          }
          return { ...prevState, [channel]: newConnection}
        } else {
          return prevState
        }
      })
    } else if(close) {
      clients[channel].close()
      delete clients[channel]
    }
  }

  const push = () => {
    if(pushNotificationSupported) {
      if(serviceWorker.isPushNotificationSupported()) {
        setAuthorization({is: true, message: ""})
        serviceWorker.register().then(() => {
          serviceWorker.askUserPermission().then(() => {
            serviceWorker.createNotificationSubscription().then(() => {

            })
          })
        })
      }
    } else setAuthorization({is: false, message: "No soportado :("})
  }

  const handleClient = value => {
    setClient(value)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={3}>
          <React.Fragment>
            <Grid item xs={6}>
              <Paper className={classes.form}>
                <div>
                  <TextField id="name" label="Channel name" variant="outlined" />
                </div>
                <div>
                  <Button onClick={newChannel} variant="contained" color="primary" className={classes.button}>
                    Boton para crear channel
                  </Button>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.form}>
                <ChatRooms chatRooms={chatRooms} connetServer={connetServer} handleClient={handleClient} />
              </Paper>
            </Grid>
          </React.Fragment>
          {authorization.is ? 
          <React.Fragment>
            <Grid item xs={6}>
              <Paper className={classes.form}>
                <Button onClick={push} variant="contained" color="primary" className={classes.button}>
                  Pedir permiso
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.form}>
                  <div><TextField error={messageError?true:false} helperText={messageError?messageError:false} id="message" label="Message" variant="outlined" /></div>
                  <div>
                    <Button onClick={send(client)} variant="contained" color="primary" className={classes.button}>
                      Boton para enviar mensaje
                    </Button>
                  </div>
              </Paper>
            </Grid>
          </React.Fragment> : 
          <React.Fragment>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                {authorization.message}
              </Paper>
            </Grid>
          </React.Fragment> }
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
