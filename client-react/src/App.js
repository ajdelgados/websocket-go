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

function App() {
  const [clients, setClients] = useState({})
  const [client, setClient] = useState({name: null})
  const [message, setMessage] = useState({popup: false, message: "", type: "error"})
  const [chatRooms, setChatRooms] = useState([])
  const [authorization, setAuthorization] = useState({is: true, message: ""})
  const [radio, setRadio] = useState(null);
  const [checked, setChecked] = useState([]);
  const [force, setForce] = useState(0)

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
        let newChannels = {}
        response.data.channels.forEach(channel => {
          newChannels[channel] = [false]
        });
        Object.assign(newChannels, checked)
        setChecked(newChannels)
        setChatRooms(response.data.channels)
      } else {
        setChatRooms(false)
      }
    }).catch(error => {
      setChatRooms(false)
      setMessage({popup: true, message: "Sin conexión!", type: "error"});
    })
  }

  const send = () => {
    if(clients[client.name] != null && clients[client.name].readyState === 1) {
      clients[client.name].send(
        JSON.stringify({
          email: "react@react.com",
          username: "react",
          message: document.getElementById("message").value,
          channel: client.name
      }))
      setMessage({popup: false, message: "", type: "error"});
    } else if(client.name == null) {
      setMessage({popup: true, message: "No hay canal suscrito", type: "error"});
    } else if (clients[client.name] == null) {
      checked[client.name] = [false]
      client.name = null
      setClient(client)
      setRadio(null)
      setChecked(checked)
      setMessage({popup: true, message: "Canal sin suscripción", type: "error"});
    } else if (client.name != null && clients[client.name].readyState !== 1) {
      checked[client.name] = [false]
      client.name = null
      setChecked(checked)
      setRadio(null)
      setClient(client)
      setMessage({popup: true, message: "Canal fuera de línea ", type: "error"});
    } else {
      setMessage({popup: true, message: "No hay canal suscrito o válido", type: "error"});
    }
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

  const connetServer =  (channel, close) => {
    if (clients[channel] == null) {
      setClients(prevState => {
        if (prevState[channel] == null) {
          let newConnection =  new W3CWebSocket(`ws${secure}://${domain}/ws/${channel}`);

          newConnection.onopen = () => {
            checked[channel][0] = false
            newConnection.name = channel
            console.log('WebSocket Client Connected');
            setChecked(checked)
            setForce(force+1)
          };
          newConnection.onmessage = (message) => {
            console.log(message.data);
            const data = JSON.parse(message.data)
            serviceWorker.sendNotification(data.message)
          };
          newConnection.onerror = () => {
            shutDownChannel(channel)
            setMessage({popup: true, message: "Sin conexión al servidor!", type: "error"});
            console.error("WebSocket error observed");
          }
          newConnection.onclose = event => {
            shutDownChannel(event.target.name)
            if(event.code !== 4000) {
              setMessage({popup: true, message: "Error conexión al servidor!", type: "error"});
            }
            console.log("Closed!")
          }
          prevState[channel] = newConnection
          return prevState
        } else {
          return prevState
        }
      })
    } else if(close) {
      clients[channel].close(4000)
      if(clients[channel] === clients[client]) {
        client.name = null
        setRadio(null)
        setClient(client)
      }
      delete clients[channel]
    } else if(clients[channel].readyState !== 1) {
      checked[channel][0] = false
      checked[channel].splice(1, 1);
      clients[channel] = null
      setChecked(checked)
      setClients(clients)
      setForce(force+1)
    }
  }

  const shutDownChannel = value => {
    if(value === client.name) {
      client.name = null
      setRadio(null)
      setClient(client)
    }
    if(checked[value]) {
      checked[value][0] = false
      checked[value].splice(1, 1);
      setForce(prev=>{
        setChecked(checked)
        return prev+1
      })
    }
    clients[value] = null
    setClients(clients)
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

  const handleRadio = value => () => {
    if(clients[value] != null && clients[value].readyState === 1) {
      client.name = value
      setClient(client)
      setRadio(value)
    } else {
      checked[value] = [false]
      if(client === value) {
        client.name = null
        setClient(client)
        setRadio(null)
      }
      setChecked(checked)
      setMessage({popup: true, message: "Canal sin suscripción", type: "error"});
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessage({popup: false, message: "", type: "error"});
  };

  const handleToggle = value => () => {
    const currentIndex = checked[value].indexOf(value);
    const newChecked = [...checked[value]];

    if (currentIndex === -1) {
      newChecked.push(value);
      newChecked[0] = true;
      checked[value] = newChecked
      setChecked(checked);
      connetServer(value)
    } else {
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
              radio={radio}
              checked={checked}
              handleRadio={handleRadio} 
              handleToggle={handleToggle} />
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
