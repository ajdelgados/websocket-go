import React, {useState} from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import logo from './logo.svg';
import './App.css';
import * as serviceWorker from './serviceWorker';

const pushNotificationSupported = serviceWorker.isPushNotificationSupported();

function App() {
  //const [client, setClient] = useState(new W3CWebSocket('wss://ajdelgados.com:8443/ws'))
  const [client, setClient] = useState(new W3CWebSocket('ws://localhost:8000/ws'))
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
        message: "Desde REact" // Strip out html
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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {authorization.is ? 
          <div>
            <button onClick={push}>Pedir permiso</button>
            <button onClick={send(client)}>Boton para enviar mensaje</button>
          </div>: authorization.message }
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
