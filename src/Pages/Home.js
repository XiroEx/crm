import React, { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListSubheader, TextField, Typography } from '@mui/material';
import GoogleButton from 'react-google-button';
import { Email } from "@mui/icons-material";

export function Home({
  signInWithGoogle,
  signInWithPassword,
  createUser
}) {

  const [signIn, setSignIn] = useState(false)
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  function closeSignIn() {
    setSignIn(false)
    setEmail('')
    setPass('')
  }
  function closeRegister() {
    closeSignIn()
    setRegister(false)
    setConfirmPass('')
  }
  function create() {
    if (pass !== confirmPass) {
      alert("Passwords don't match")
      return
    } else {
      if (pass.length < 7) {
        alert("Password must be 7 characters")
        return
      } else {
        createUser(email, pass)
      }
    }
  }
  function logIn() {
    signInWithPassword(email, pass)
  }

  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
    <Box sx={{m:'auto',mt:5, textAlign:'center', padding:5, maxWidth:'800px'}}> 
      <Typography sx={{whiteSpace:'pre-wrap', lineHeight:'2', fontSize:{xs:'.9em',sm:'1em'}}}>{"simple SMS contact management\nsend individual & mass text messages\nregister & swap numbers on the fly"}</Typography>
      <Button onClick={()=>setSignIn(true)} sx={{m:'auto', width:'240px', height:'50px', mb:2, mt:2, borderRadius:0, paddingLeft:'58px', textTransform: "none", fontSize:'16px', fontWeight:'normal'}} 
        startIcon={<Email sx={{position:'absolute', left:'5px', height:'40px', width:'40px', top:'5px'}}/>} 
        variant="contained">Sign in with Email</Button>
      <GoogleButton style={{margin:'auto'}} onClick={signInWithGoogle}/>
    </Box>

    <Dialog open={signIn} onClose={()=>setSignIn(false)} fullWidth>
      <DialogTitle>
        Sign In With Email
      </DialogTitle>
      <DialogContent> 
        <form id="signin" onSubmit={(e)=>{e.preventDefault(); logIn()}}>
          <TextField variant="outlined" type='email' placeholder="Email" fullWidth margin="dense" size="small" onChange={(e)=>setEmail(e.target.value)} value={email}/>
          <TextField variant="outlined" type='password' placeholder="Password" fullWidth margin="dense" size="small" onChange={(e)=>setPass(e.target.value)} value={pass}/>
        </form>
      </DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item xs={4} sx={{textAlign:'left'}}>
            <Button variant="text" sx={{float:'left'}} onClick={()=>setRegister(true)}>Register</Button>   
          </Grid>
          <Grid item xs={8} sx={{textAlign:'right'}}>
            <Button variant="contained" sx={{mr:1}} onClick={closeSignIn}>Cancel</Button> 
            <Button variant="contained" type="submit" form="signin" onClick={logIn}>Sign In</Button> 
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>

    <Dialog open={register} onClose={()=>setRegister(false)} fullWidth>
      <DialogTitle>
        Register a new account
      </DialogTitle>
      <DialogContent>
        <form id="signup" onSubmit={(e)=>{e.preventDefault(); create()}}>
          <TextField variant="outlined" type='email' placeholder="Email" fullWidth margin="dense" size="small" onChange={(e)=>setEmail(e.target.value)} value={email}/>
          <TextField variant="outlined" type='password' placeholder="Password" fullWidth margin="dense" size="small" onChange={(e)=>setPass(e.target.value)} value={pass}/>
          <TextField variant="outlined" type='password' placeholder="Confirm Password" fullWidth margin="dense" size="small" onChange={(e)=>setConfirmPass(e.target.value)} value={confirmPass}/>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" sx={{mr:1}} onClick={closeRegister}>Cancel</Button> 
        <Button variant="contained" type="submit" form="signup" onClick={create}>Register</Button> 
      </DialogActions>
    </Dialog>

  </Box>
}