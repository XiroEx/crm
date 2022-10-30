import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, IconButton, List, ListItem, useMediaQuery, useTheme } from "@mui/material";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function({userData, db, setSendValue}) {
    const [remove, setRemove] = useState(false)
    const [send, setSend] = useState(false)
    const navigate = useNavigate()
    const theme = useTheme();
    const lg = useMediaQuery(theme.breakpoints.up('lg'));

    async function removeDraft() {
        const data = remove.data
        const docRef = doc(db, `users/${userData.id}`)
        await updateDoc(docRef, {drafts:arrayRemove(data)})
        setRemove(false)
    }
    return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>   
        {userData.drafts?.length > 0 ? <List>
            <h4>Drafts</h4>
            {userData.drafts?.map(draft=>(
                <ListItem button onClick={()=>setSend({open:true,data:draft})}
                secondaryAction={<IconButton sx={{color:'#fff'}} 
                    onClick={(e)=>{e.stopPropagation();setRemove({open:true, data:draft})}}><Delete/></IconButton>}>
                    {draft.length > 35 ? draft.substring(0,34).concat('...'):draft}
                </ListItem>
            ))}
        </List> : <Box sx={{textAlign:'center', mt:10}}>
            No Drafts Saved
        </Box>}
        {userData.scheduled?.length > 0 ? <List>
            <h4>Scheduled</h4>
            {userData.scheduled?.map(scheduled=>(
                <ListItem button disabled={scheduled.sent} onClick={()=>alert('Info Coming Soon')}
                secondaryAction={<IconButton sx={{color:'#fff'}} 
                    onClick><Delete/></IconButton>}>
                    {scheduled.body.length > 35 ? scheduled.body.substring(0,34).concat('...'):scheduled.body}
                </ListItem>
            ))}
        </List> : <Box sx={{textAlign:'center', mt:10}}>
            No Scheduled Texts
        </Box>}

        <Fab color="primary" sx={{position:'fixed', right:20, bottom:20}}>
            <Add/>
        </Fab>

        <Dialog fullWidth open={remove.open} onClose={()=>setRemove(false)}>
            <DialogTitle>Delete Draft?</DialogTitle>
            <DialogContent>{remove.data}</DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={()=>setRemove(false)}>Cancel</Button>
                <Button variant='contained' onClick={removeDraft} color='error'>Delete</Button>
            </DialogActions>
        </Dialog>
        
        <Dialog fullWidth open={send.open} onClose={()=>setSend(false)}>
            <DialogTitle>Draft</DialogTitle>
            <DialogContent>{send.data}</DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={()=>{setSendValue(send.data); navigate('/send')}}>Send</Button>
            </DialogActions>
        </Dialog>
    </Box>
}