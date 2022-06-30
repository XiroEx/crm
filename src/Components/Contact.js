
import { AddCircle, Send, Star, StarBorder } from "@mui/icons-material";
import { Box, Chip, CircularProgress, Divider, Grid, IconButton, List, ListItem, Backdrop } from "@mui/material";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Add from "./Contacts/Add";
import Info from "./Contacts/Info";


export function Contact({
  contact,
  userData,
  db
}) {
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(false)
  const [add, setAdd] = useState(false)
  const navigate = useNavigate()

  async function deleteTag(tag){
    setLoading(true)
    await updateDoc(doc(db,`users/${userData.id}/contacts`,contact.id), {tags:arrayRemove(tag)})
    let exists = false
    for (let c of userData.contacts.filter(c=>(c.id!=contact.id))) {
      if (c.tags?.includes(tag)){ 
        exists = true
      }
    }
    if (!exists) await updateDoc(doc(db,`users/`,userData.id), {tags:arrayRemove(tag)})
    setLoading(false)
  }

  return <Box sx={{textAlign:'center', maxWidth:'800px', m:'auto', mt:2}}>
    <Grid container spacing={0}>
      <Grid container item xs={12}>
        <Grid container>
          <Grid item xs={10} sx={{textAlign:'left'}}>
            {contact.name || 'Unnamed'}
          </Grid>
          <Grid item xs={2} sx={{textAlign:'right'}}>
            <IconButton sx={{pt:0,color:"white"}} onClick={()=>navigate(`/conversations/${contact.primary}`)}><Send/></IconButton>
          </Grid>
        </Grid>
        <Divider sx={{mt:3, width:'100%'}}/>
      </Grid>
      <Grid item xs={12}>
        <List>
          <p style={{fontVariant:'small-caps'}}>Numbers</p>
          {contact.numbers.map(num=>(
          <ListItem button onClick={()=>setInfo({open:true, data:num})}
            secondaryAction={num == contact.primary? <IconButton disableRipple sx={{color:'#fff'}}><Star/></IconButton>:<IconButton sx={{color:'#fff'}} 
              onClick={(e)=>{e.stopPropagation();alert('set primary')}}><StarBorder/></IconButton>}>
            {num}
          </ListItem>))}
          <ListItem sx={{justifyContent:'flex-end', pr:0}}><IconButton color="primary" onClick={()=>{setAdd({open:true,data:'numbers'})}}><AddCircle/></IconButton></ListItem>
        </List>
      </Grid> 
      <Grid item xs={12}> 
        <p style={{fontVariant:'small-caps'}}>Tags</p>
        {contact.tags?.length > 0 && <>
          {contact.tags.map(tag=>(
            <Chip color='primary' label={tag} onDelete={()=>deleteTag(tag)} sx={{m:.2}}/>
          ))}
        </>}
        <ListItem sx={{justifyContent:'flex-end', pr:0}}><IconButton color="primary" onClick={()=>{setAdd({open:true,data:'tags'})}}><AddCircle/></IconButton></ListItem>
      </Grid>
      <Grid item xs={12}>
        <List>
          <p style={{fontVariant:'small-caps'}}>Notes</p>
          {contact.notes.map(note=>(<ListItem button onClick={()=>setInfo({open:true, data:note})}>
            <Grid container>
              <Grid item xs={3} sx={{fontSize:'.75em'}}>{new Date(note.date).toLocaleString()}</Grid>
              <Grid item xs={9} sx={{textAlign:'right'}}>
                {note.body.length > 25 ? note.body.substring(0,24).concat('...') : note.body}
              </Grid>
            </Grid>
          </ListItem>))}
          <ListItem sx={{justifyContent:'flex-end', pr:0}}><IconButton color="primary" onClick={()=>{setAdd({open:true,data:'notes'})}}><AddCircle/></IconButton></ListItem>
        </List>
      </Grid>
    </Grid>
    <Add {...{add, setAdd, contact, userData, db}}/>
    <Info {...{ info, setInfo, contact, userData, db}}/>
    <Backdrop open={loading}><CircularProgress/></Backdrop>
  </Box>
}
  