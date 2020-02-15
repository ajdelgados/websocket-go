import React, {useContext} from "react"
import { ListItem, ListItemIcon, FormControlLabel, Radio, ListItemText, ListItemSecondaryAction, Checkbox } from '@material-ui/core';
import { CheckedContext } from "../context/CheckedContext";

const ChatRoom = props => {

  const [checked] = useContext(CheckedContext);

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
          checked={checked[props.item].indexOf(props.item) !== -1}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': props.item }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default ChatRoom