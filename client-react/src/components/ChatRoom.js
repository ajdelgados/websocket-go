import React from "react"
import {
  makeStyles,
  ListItem,
  ListItemIcon,
  FormControlLabel,
  Radio,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  checkProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -18,
  },
}))

const ChatRoom = props => {
  const { item, channelsDispatch, actived, setMessage, serviceWorker } = props
  const classes = useStyles();

  return (
    <ListItem onClick={() => channelsDispatch({type: "select", channel: item})} role={undefined} dense button >
      <ListItemIcon>
        <FormControlLabel
          onClick={() => channelsDispatch({type: "select", channel: item})}
          value={item}
          control={<Radio color="primary" />}
        />
      </ListItemIcon>
      <ListItemText id={item} primary={item} />
      <ListItemSecondaryAction>
        <Checkbox
          edge="start"
          tabIndex={-1}
          disableRipple
          onChange={() => channelsDispatch({
            type: "subscribe", 
            channel: item, 
            channelsDispatch: channelsDispatch,
            setMessage: setMessage,
            serviceWorker: serviceWorker
          })}
          checked={actived.indexOf(item) !== -1}
          disabled={actived[0]}
          inputProps={{ 'aria-labelledby': item }}
        />
        {actived[0] && <CircularProgress size={24} className={classes.checkProgress} />}
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default ChatRoom