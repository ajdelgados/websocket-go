import React, {useState, useEffect, useReducer} from 'react';
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
const secure = "" // s or empty

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

const channelsInit = {
  client: null,          //Client and radio
  channels: false,       //ChatRooms and Checked
  webSockets: {}         //Clients
}

function channelsReducer(state, action) {
  switch (action.type) {
    case 'setChannels':
      if(action.channels) {
        let newChannels = {}
        action.channels.forEach(channel => {
          newChannels[channel] = [false]
        });
        Object.assign(newChannels, state.channels)
        state.channels = newChannels
      }
      return {...state};
    
    case 'subscribe':
      if (state.webSockets[action.channel] && state.webSockets[action.channel].readyState === 1) {
        state.webSockets[action.channel].close(4000)
      } else {
        let newConnection =  new W3CWebSocket(`ws${secure}://${domain}/ws/${action.channel}`);
        newConnection.onopen = () => {
          action.channelsDispatch({type: 'websocketOpen', channel: action.channel})
          console.log('WebSocket Client Connected');
        };
        newConnection.onmessage = message => {
          console.log(message.data);
          const data = JSON.parse(message.data)
          action.serviceWorker.sendNotification(data.message)
        };
        newConnection.onclose = event => {
          action.channelsDispatch({type: 'websocketClose', channel: action.channel})
          if(event.code !== 4000) {
            action.setMessage({popup: true, message: "Error conexión al servidor!", type: "error"});
          }
          console.log("Closed!")
        }
        state.channels[action.channel][0] = true
        state.channels[action.channel].push(action.channel);
        state.webSockets[action.channel] = newConnection
      }
      return {...state}
    case 'select':
      if(state.webSockets[action.channel] && state.webSockets[action.channel].readyState === 1)
        state.client = action.channel
      else if(state.webSockets[action.channel]) {
        state.webSockets[action.channel].close()
      }
      return {...state}
    case 'websocketOpen':
      state.channels[action.channel][0] = false
      return {...state}
    case 'websocketClose':
      if(action.channel === state.client) 
        state.client = null
      state.channels[action.channel][0] = false
      state.channels[action.channel].splice(1, 1);
      state.webSockets[action.channel] = null
      return {...state}
    default:
      throw new Error();
  }
}

function App() {
  const [message, setMessage] = useState({popup: false, message: "", type: "error"})
  const [authorization, setAuthorization] = useState({is: true, message: ""})
  const [channels, channelsDispatch] = useReducer(channelsReducer, channelsInit)

  useEffect(() => {
    getChannels()
  },[])

  const classes = useStyles();

  axios.defaults.baseURL = `http${secure}://${domain}`;
  axios.defaults.headers.common = {
    "Content-Type": "application/json",
  };

  const getChannels = () => {
    axios.get("/channels").then(response => {
      if(response.data.channels != null) {
        channelsDispatch({type: 'setChannels', channels: response.data.channels})
      } else {
        channelsDispatch({type: 'setChannels', channels: false})
      }
    }).catch(error => {
      channelsDispatch({type: 'setChannels', channels: false})
      setMessage({popup: true, message: "Sin conexión!", type: "error"});
    })
  }

  const newChannel = () => {
    axios.post("/channels", JSON.stringify({name: document.getElementById("name").value})).then(response => {
      if(response.status === 201){
        document.getElementById("name").value = ""
        getChannels()
      }
    }).catch(() =>{
      setMessage({popup: true, message: "Error al enviar información al servidor", type: "error"});
    })
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({popup: false, message: "", type: "error"});
  };

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

  const send = () => {
    if(channels.webSockets[channels.client] && channels.webSockets[channels.client].readyState === 1) {
      channels.webSockets[channels.client].send(
        JSON.stringify({
          email: "react@react.com",
          username: "react",
          message: document.getElementById("message").value,
          channel: channels.client
      }))
      setMessage({popup: false, message: "", type: "error"});
    } else if(channels.client == null) {
      setMessage({popup: true, message: "No hay canal suscrito", type: "error"});
    } else {
      setMessage({popup: true, message: "No hay canal válido", type: "error"});
    }
  }

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
              channels={channels}
              channelsDispatch={channelsDispatch}
              serviceWorker={serviceWorker}
              setMessage={setMessage} />
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
              <Button onClick={send} variant="contained" color="primary" className={classes.button}>
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
