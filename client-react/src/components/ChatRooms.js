import React, { useState } from "react"
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, RadioGroup, List, ListSubheader } from '@material-ui/core';
import ChatRoom from './ChatRoom'

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
}));

const ChatRooms = props => {
    const [radio, setRadio] = useState([0]);

    const handleRadio = value => () => {
        props.handleClient(value)
        setRadio(value)
    }

    const classes = useStyles();

    return (
        <FormControl component="fieldset">
            <RadioGroup aria-label="channel" name="channel" value={radio}>
                <List
                    subheader={<ListSubheader>Channels</ListSubheader>}
                    className={classes.root}
                >
                    {props.chatRooms ? props.chatRooms.map(element => {
                        return <ChatRoom key={element} connetServer={props.connetServer} handleRadio={handleRadio} item={element} />
                        }):<div className={classes.paper}>Without chat rooms</div>
                    }
                </List>
            </RadioGroup>
        </FormControl>
    )
}

export default ChatRooms