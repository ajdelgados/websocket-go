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
  const { item, channelsDispatch, actived } = props
  const classes = useStyles();

  return (
    <ListItem onClick={() => channelsDispatch({type: "select"})} role={undefined} dense button >
      <ListItemIcon>
        <FormControlLabel
          onClick={() => channelsDispatch({type: "select"})}
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
          onChange={() => channelsDispatch({type: "subscribe", channel: item})}
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