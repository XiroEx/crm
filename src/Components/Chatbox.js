import { Drafts, Send } from '@mui/icons-material';
import { Box, CircularProgress, Grid, IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../functions/extractnumbers";
import SaveDraft from './SaveDraft';

export function Chatbox({sendTarget, sendText, active, userData, db, 
    sendValue, setSendValue, inbox, setInbox}) {

  const value = sendValue || ''
  const setValue = setSendValue
  const [loading, setLoading] = useState(false)
  const [save, setSave] = useState(false)
  const navigate = useNavigate()
  const ref = useRef()
  ref.current = sendTarget

  return <Box sx={{position:'fixed', bottom:0, margin:'auto', maxWidth:{lg:'calc(100vw - 260px)'}, width:'calc(100vw - 20px)', pb:{xs:2, md:2}, pt:1, m:0, bgcolor:'#282c34'}}>
    <Grid container spacing={1}>
      <Grid item xs={1} sx={{textAlign:'center'}}>
        {value.length > 160 ? <Box sx={{fontSize:{xs:'.7em'}}}>{`${value.length}
          / 160`}</Box>:<IconButton disabled={value==''}sx={{transform:'scale(1.35)', pl:0, color:'white'}}
          onClick={()=>setSave(true)}><Drafts/></IconButton>}
      </Grid>
      <Grid item xs={11}>
        <TextField placeholder="message..." variant="outlined" size="small" autoComplete='off' value={value}
          onChange={e=>setValue(e.target.value)}
          sx={{ width: '100%' ,'& .MuiInputBase-root':{background:'white', borderRadius:5,}}}
          InputProps={{sx:{color:value.length > 160 ? 'red':'',},endAdornment:<InputAdornment position='end'>
            <IconButton edge="end" onClick={()=>{
              console.log({ from:active,to:sendTarget,body:value});
              const sendT=sendTarget.map(t=>(t.num ? formatNumber(t.num) : formatNumber(t)))
              setLoading(true)
              if (!userData.active){
                 alert('Account inactive. Contact billing administrator or support.')
                 setLoading(false)
              } else if (userData.credits && userData.credits > sendT.length) {
                alert(`Insufficient credits. ${userData.id == userData.billing ? 'Purchase credits on account page':'Contact billing administrator'}`)
                
              } else sendText({ from:active,to:sendT,body:value,userData:userData})
              .then(async result => {
                if (sendT.length == 1) {
                  let newInbox = inbox.slice()
                  let index = false
                  for (const [i, c] of newInbox.entries()) {
                    if(c.number == sendT[0]) index = i
                  }
                  if (index === false) {
                    newInbox.unshift({ number:sendT[0], messages:[] })
                    index = 0
                  }
                  newInbox[index].messages.push({
                    date: Date.now(),
                    body: value,
                    sent: true,
                  })
                  let convo = newInbox.splice(index,1)
                  newInbox.unshift(convo[0])
                  setInbox(newInbox)
                }
                setValue('')
                setLoading(false)
                if (sendTarget.length == 1) 
                  navigate(`/conversations/${sendTarget[0].num ? formatNumber(sendTarget[0].num) : formatNumber(sendTarget[0])}`)
              })}}>{loading ? <CircularProgress style={{height:20, width:20}}/>:<Send/>}
            </IconButton>
          </InputAdornment>}}
          multiline maxRows={5}
        />
      </Grid>
    </Grid>
    <SaveDraft {...{save, setSave, value, setValue, userData, db}}/>
  </Box>
}