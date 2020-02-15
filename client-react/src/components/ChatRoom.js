import React, {useContext} from "react"
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
  const classes = useStyles();

  return (
    <ListItem onClick={props.handleRadio(props.item)} role={undefined} dense button >
      <ListItemIcon>
        <FormControlLabel
          onClick={props.handleRadio(props.item)}
          value={props.item}
          control={<Radio color="primary" />}
        />
      </ListItemIcon>
      <ListItemText id={props.item} primary={props.item} />
      <ListItemSecondaryAction>
        <Checkbox
          onChange={props.handleToggle(props.item)}
          edge="start"
          checked={props.checked !== -1}
          tabIndex={-1}
          disabled={props.disabled}
          disableRipple
          inputProps={{ 'aria-labelledby': props.item }}
        />
        {props.disabled && <CircularProgress size={24} className={classes.checkProgress} />}
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default ChatRoom