import React from "react"
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, Divider, FormControl, RadioGroup, List } from '@material-ui/core';
import ChatRoom from './ChatRoom'

const useStyles = makeStyles(theme => ({
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
}));

const ChatRooms = props => {
    const classes = useStyles();

    return (
        <Card> 
            <CardHeader
                subheader="Channels" />
            <Divider />
            <FormControl fullWidth component="fieldset">
                <RadioGroup aria-label="channel" name="channel" value={props.radio}>
                    <List>
                        {props.chatRooms ? props.chatRooms.map(element => {
                            return <ChatRoom
                              key={element}
                              item={element}
                              checked={props.checked[element].indexOf(element)}
                              disabled={props.checked[element][0]}
                              handleRadio={props.handleRadio}
                              handleToggle={props.handleToggle} />
                            }):<div className={classes.paper}>Without chat rooms</div>
                        }
                    </List>
                </RadioGroup>
            </FormControl>
        </Card>
    )
}

export default ChatRooms