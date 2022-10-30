import { Add, AddCircle } from "@mui/icons-material"
import { Box, Fab, Grid, IconButton, List, ListItem } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AddContact } from "../Components/AddContact"
import { Contact } from "../Components/Contact"

export function Contacts({
  userData,
  db
}) {
  const [add, setAdd] = useState(false)
  const navigate = useNavigate()
  const params = useParams()
  const props = {
    userData:userData,
    db:db
  }
  const data = userData.contacts.sort((a,b)=>(a.name > b.name))
  let dataObject = {}
  data.forEach(d=>{
    if (!dataObject[d.name[0].toUpperCase()]) dataObject[d.name[0].toUpperCase()] = [d]
    else dataObject[d.name[0].toUpperCase()].push(d)
  })
  const contact = userData.contacts.filter(c=>(c.numbers.includes(params.number)))[0] || undefined
  useEffect(()=>{
    if (!contact && params.number) navigate('/contacts')
  },[])
  
  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>   
    <Box sx={{maxWidth:'800px', m:'auto', width:'100%', mt:2}}>
      {!params.number && <>
        {Object.keys(dataObject).map(letter =>(
          <Grid container sx={{width:'100%'}}>
            <Grid item xs={1}>{letter}</Grid>
            <Grid item xs={11}>
              <List sx={{width:'100%'}}>
                {dataObject[letter].map(c=>(
                  <ListItem button onClick={()=>navigate(`/contacts/${c.primary}`)}>{c.name}</ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        ))}
        <Fab color="primary" onClick={()=>{setAdd(true)}} sx={{position:'fixed', right:20, bottom:20}}>
            <Add/>
        </Fab>
      </>}
      {contact && <Contact {...props} contact={contact}/>}
    </Box>

    <AddContact userData={userData} db={db} add={add} setAdd={setAdd} />
  </Box>
}
  