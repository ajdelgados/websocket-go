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
    const { channels, channelsDispatch } = props
    const classes = useStyles();
    return (
        <Card> 
            <CardHeader
                subheader="Channels" />
            <Divider />
            <FormControl fullWidth component="fieldset">
                <RadioGroup aria-label="channel" name="channel" value={channels.client}>
                    <List>
                        {channels.channels ? Object.keys(channels.channels).map(channel => {
                            return <ChatRoom
                              key={channel}
                              item={channel}
                              channelsDispatch={channelsDispatch}
                              actived={channels.channels[channel]} />
                            }):<div className={classes.paper}>Without chat rooms</div>
                        }
                    </List>
                </RadioGroup>
            </FormControl>
        </Card>
    )
}

export default ChatRooms