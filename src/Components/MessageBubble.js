import { Grid, ListItem, Divider, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import '../css/Chat.css';

export function MessageBubble({message,}) {
    let date = new Date(message.date)
    let d = date.getDate() == (new Date()).getDate() ? date.toLocaleTimeString() : date.toLocaleDateString()
    return <ListItem key={message.date} sx={{width:'100%', position:'relative', p:.5, pt:.25, 
        pb:.25, fontSize:{lg:'.5em',xs:'.85em'}, display:'flex', justifyContent:message.sent?'flex-end':''}}>
            <p style={{maxWidth:'75%',}} className='chat' >{message.body}</p>
            <div style={{position:'absolute', left:message.sent?0:'', right:message.sent?'':0, fontSize:'.75em'}}>{d}</div>
        </ListItem>
}