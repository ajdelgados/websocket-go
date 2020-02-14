import React from "react"
import { ListItem, ListItemIcon, FormControlLabel, Radio, ListItemText, ListItemSecondaryAction, Checkbox } from '@material-ui/core';

const ChatRoom = props => {
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
          <ListItemSecondaryAction onClick={props.handleToggle(props.item)}>
            <Checkbox
              edge="start"
              checked={props.checked[props.item] || false}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': props.item }}
            />
          </ListItemSecondaryAction>
        </ListItem>
    )
}

export default ChatRoom