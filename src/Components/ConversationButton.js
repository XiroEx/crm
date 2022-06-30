import { Grid, ListItem, Divider } from '@mui/material';
import { Link,  } from 'react-router-dom';

export function ConversationButton({conversation, userData}) {
    const date = new Date(conversation.messages[conversation.messages.length-1].date)
    const d = date.getDate() == (new Date()).getDate() ? date.toLocaleTimeString() : date.toLocaleDateString()
    let number = userData.contacts.filter(c=>(c.numbers.includes(conversation.number)))[0]?.name || conversation.number
    return <><ListItem button sx={{fontSize:{lg:'.5em',xs:'.85em'}}}>
        <Grid container>
            <Grid container item xs={12}>
                <Grid item xs={6}><h4 style={{margin:5}}>{number}</h4></Grid>
                <Grid item xs={6} style={{textAlign:'right'}}><span style={{margin:5}}>{d}</span></Grid>
            </Grid>
            <Grid item xs={12}>
                <p style={{textIndent:'5%', padding:0, margin:0, color:'gray'}}>{(conversation.messages[conversation.messages.length-1].body.substring(0,93).concat(conversation.messages[conversation.messages.length-1].body.length > 94 ? '...':''))}</p>
            </Grid>
        </Grid>
        </ListItem><Divider style={{color:'#fff'}}/>
    </>

}