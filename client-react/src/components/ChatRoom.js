import React, { useState } from "react"
import { ListItem, ListItemIcon, FormControlLabel, Radio, ListItemText, ListItemSecondaryAction, Checkbox } from '@material-ui/core';

const ChatRoom = props => {
    const [checked, setChecked] = useState([0]);

    const handleToggle = value => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
            props.connetServer(value)
        } else {
            newChecked.splice(currentIndex, 1);
            props.connetServer(value, true)
        }

        setChecked(newChecked);
    };

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
          <ListItemSecondaryAction onClick={handleToggle(props.item)}>
            <Checkbox
              edge="start"
              checked={checked.indexOf(props.item) !== -1}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': props.item }}
            />
          </ListItemSecondaryAction>
        </ListItem>
    )
}

export default ChatRoom