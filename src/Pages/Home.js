import React from "react";
import { Box, Button, List, ListItem, ListSubheader, Typography } from '@mui/material';
import GoogleButton from 'react-google-button';
import { Email } from "@mui/icons-material";

export function Home({
  signInWithGoogle
}) {
  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
    <Box sx={{m:'auto',mt:5, textAlign:'center', padding:5, maxWidth:'800px'}}> 
      <Typography sx={{whiteSpace:'pre-wrap', lineHeight:'2', fontSize:{xs:'.9em',sm:'1em'}}}>{"simple SMS contact management\nsend individual & mass text messages\nregister & swap numbers on the fly"}</Typography>
      <Button disabled sx={{m:'auto', width:'240px', height:'50px', mb:2, mt:2, borderRadius:0, paddingLeft:'58px', textTransform: "none", fontSize:'16px', fontWeight:'normal'}} 
        startIcon={<Email sx={{position:'absolute', left:'5px', height:'40px', width:'40px', top:'5px'}}/>} 
        variant="contained">Sign in with Email</Button>
      <GoogleButton style={{margin:'auto'}} onClick={signInWithGoogle}/>
    </Box>
  </Box>
}
  