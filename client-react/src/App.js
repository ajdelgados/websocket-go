import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as serviceWorker from './serviceWorker';
import ChatRooms from './components/ChatRooms'

const pushNotificationSupported = serviceWorker.isPushNotificationSupported();
const domain = "localhost:8000"
const secure = ""

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
    },
  },
  button: {
    margin: theme.spacing(1),
  },
}));

function Message(props) {
  return <Alert elevation={6} variant="filled" {...props} />;
}

function App() {
  const [clients, setClients] = useState({})
  const [client, setClient] = useState()
  const [message, setMessage] = useState({popup: false, message: "", type: "error"})
  const [chatRooms, setChatRooms] = useState([])
  const [authorization, setAuthorization] = useState({is: true, message: ""})
  const [radio, setRadio] = useState(null);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    getChannels()
  }, [])

  const classes = useStyles();

  axios.defaults.baseURL = `http${secure}://${domain}`;
  axios.defaults.headers.common = {
    "Content-Type": "application/json",
  };

  const send = client => () => {
    if(clients[client] != null && clients[client].readyState === 1) {
      clients[client].send(
        JSON.stringify({
          email: "react@react.com",
          username: "react",
          message: document.getElementById("message").value,
          channel: client
      }))
      setMessage({popup: false, message: "", type: "error"});
    } else if (client != null && clients[client].readyState !== 1) {
      setRadio(null)
      setClient(null)
      setMessage({popup: true, message: "Canal fuera de línea ", type: "error"});
    } else {
      setMessage({popup: true, message: "No hay canal suscrito", type: "error"});
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
      response.data.channels.forEach(channel => {
        checked[channel] = false
      });
      setChatRooms(response.data.channels)
    }).catch(error => {
      setMessage({popup: true, message: "Sin conexión!", type: "error"});
    })
  }

  const connetServer =  (channel, close) => {
    if (clients[channel] == null) {
      setClients(prevState => {
        if (prevState[channel] == null) {
          let newConnection =  new W3CWebSocket(`ws${secure}://${domain}/ws/${channel}`);

          newConnection.onopen = () => {
            newConnection.name = channel
            console.log(newConnection.name)
            console.log('WebSocket Client Connected');
          };
          newConnection.onmessage = (message) => {
            console.log(message.data);
            const data = JSON.parse(message.data)
            serviceWorker.sendNotification(data.message)
          };
          newConnection.onclose = (clients, client) => event => {
            console.log(client)
            console.log(clients[client])
            if(event.code !== 4000) {
              console.log("Entro en el if del close")
            }
            console.log("Closed!")
          }
          return { ...prevState, [channel]: newConnection}
        } else {
          return prevState
        }
      })
    } else if(close) {
      clients[channel].close(4000)
      if(clients[channel] === clients[client]) {
        setRadio(null)
        setClient(null)
      }
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

  const handleRadio = value => () => {
      handleClient(value)
      setRadio(value)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({popup: false, message: "", type: "error"});
  };

  const handleToggle = value => () => {
    console.log(value)
    console.log(checked)
    console.log(checked[value])
    if(checked[value] === undefined) {
      checked[value] = true
      setChecked(checked)
    } else if(!checked[value]) {
      /*setChecked(prevState => {
        prevState[value] = true
        return prevState
      })*/
      connetServer(value)
    } else {
      /*setChecked(prevState => {
        prevState[value] = false
        return prevState
      })*/
      checked[value] = false
      setChecked(checked)
      connetServer(value, true)
    }
  };

  return (
    <Grid container spacing={1}>
      <React.Fragment>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card> 
            <CardHeader
              subheader="Create Channel" />
            <Divider />
            <CardContent>
              <TextField fullWidth id="name" label="Channel name" variant="outlined" className={classes.form}/>
            </CardContent>
            <CardActions>
              <Button onClick={newChannel} variant="contained" color="primary" className={classes.button}>
                Create
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper className={classes.form}>
            <ChatRooms
              chatRooms={chatRooms}
              handleRadio={handleRadio} 
              radio={radio}
              handleToggle={handleToggle}
              checked={checked} />
          </Paper>
        </Grid>
      </React.Fragment>
      {authorization.is ? 
      <React.Fragment>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardActions>
            <Button onClick={push} variant="contained" color="primary" className={classes.button}>
              Ask permission
            </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardHeader
              subheader="Send Message" />
            <Divider />
            <CardContent>
              <TextField fullWidth id="message" label="Message" variant="outlined" />
            </CardContent>
            <CardActions>
              <Button onClick={send(client)} variant="contained" color="primary" className={classes.button}>
                Send message
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </React.Fragment> : 
      <React.Fragment>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {authorization.message}
          </Paper>
        </Grid>
      </React.Fragment> }
      <Snackbar open={message.popup} autoHideDuration={5000} onClose={handleClose}>
        <Message onClose={handleClose} severity={message.type}>
          {message.message}
        </Message>
      </Snackbar>
    </Grid>
  );
}

export default App;
