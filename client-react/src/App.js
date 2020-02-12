import React, {useState} from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, TextField, Button } from '@material-ui/core';
import * as serviceWorker from './serviceWorker';

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
  const classes = useStyles();
  //const [client, setClient] = useState(new W3CWebSocket('wss://ajdelgados.com:8443/ws'))
  const [client] = useState(new W3CWebSocket('ws://localhost:8000/ws/tttt'))
  const [authorization, setAuthorization] = useState({is: true, message: ""})
  /*serviceWorker.askUserPermission().then(consent => {console.log(
     "Permitido", consent
  )})
  serviceWorker.createNotificationSubscription()*/
  client.onopen = () => {
    console.log('WebSocket Client Connected');
  };
  client.onmessage = (message) => {
    console.log(serviceWorker)
    console.log('WebSocket Client Connected');
    console.log(message.data);
    const data = JSON.parse(message.data)
    serviceWorker.sendNotification(data.message)
    console.log("Luego del serviceworker")
  };

  const send = client => () => {
    console.log(client)
    client.send(
      JSON.stringify({
        email: "react@react.com",
        username: "react",
        message: document.getElementById("message").value,
        channel: "tttt"
    }))
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

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={3}>
          {authorization.is ? 
          <React.Fragment>
            <Grid item xs={6}>
              <Paper className={classes.paper}>
                <Button onClick={push} variant="contained" color="primary">
                  Pedir permiso
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.form}>
                  <div><TextField id="message" label="Message" variant="outlined" /></div>
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
