import React, { useRef } from "react";
import { Box, CircularProgress, Grid, List, ListItem, ListSubheader, BottomNavigation, 
        InputAdornment, TextField, Divider, IconButton, Chip } from '@mui/material';
import { Chatbox } from '../Components/Chatbox';
import { formatNumber } from "../functions/extractnumbers";
import { MessageBubble } from "../Components/MessageBubble";

export function Send({
  sendTarget, setSendTarget, sendText,
  active, userData, inbox,
  setInbox, buildInbox, db, 
  sendValue, setSendValue,
}) {
  const [state, setState] = React.useState(false)
  const [messages, setMessages] = React.useState([])
  const bottom = useRef()
  /*React.useEffect(async ()=>{
    if (!inbox && active) {
      const result = await buildInbox({number:active})
      if (result.data.success) setInbox(result.data.data)
    }
    window.addEventListener('resize', ()=>bottom.current.scrollIntoView(true))
  },[])

  React.useEffect(async ()=>{
    if (!inbox && active) {
      const result = await buildInbox({number:active})
      if (result.data.success) setInbox(result.data.data)
    }
  },[active])*/
  
  React.useEffect(async ()=>{
    if (sendTarget.length == 1 && !inbox && active) {
      const result = await buildInbox({number:active})
      if (result.data.success) setInbox(result.data.data)
    }
    window.addEventListener('resize', ()=>bottom.current.scrollIntoView(true))
    return window.removeEventListener('resize', ()=>bottom.current.scrollIntoView(true))
  },[])

  React.useEffect(async ()=>{
    if (sendTarget.length == 1 && inbox){
      const number = sendTarget[0].num || formatNumber(sendTarget[0])
      if(inbox.filter(i=>{return i.number == number}).length !== 0) {
        let m = inbox.filter(i=>{return i.number == number})[0].messages
        setMessages(m)
      }
    }
  }, [inbox, sendTarget])

  React.useEffect(async ()=>{
    if(bottom.current)
      bottom.current.scrollIntoView(true)
  },[messages])

  const ref = useRef()
  ref.current = sendTarget
  return <>
    <Box  className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
      {sendTarget.length > 1 && <List sx={{pt:'40px', textAlign:'center'}}>
        {sendTarget.map(t=>(
          <Chip color='primary' onDelete={()=>{
            let newV = JSON.parse(JSON.stringify(ref.current))
            let index = false
            newV.forEach((val,i) => {
              val = val.num ? formatNumber(val.num) : userData.tags.includes(val) ? val : formatNumber(val)
              t = t.num ? formatNumber(t.num) : userData.tags.includes(t) ? t : formatNumber(t)
              if (t == val) {
                index = i
                return
              }
            })
            if (index !== false){ 
              newV.splice(index, 1)
              setSendTarget(newV)
            }
          }} label={t.num || t}
            sx={{p:0,m:.25, width:'32%', maxWidth:'128px'}}/>
        ))}
      </List>}
      {(sendTarget.length == 1 && !userData.tags?.includes(sendTarget[0])) && <>
        {inbox && <List sx={{pt:'40px'}}>
          {messages.length > 0 && messages.map(m=>(<MessageBubble message={m}/>))}
          <Box sx={{m:3}} ref={bottom}/>
        </List>}
        {!inbox && <CircularProgress/>}
      </>}
      <Box sx={{m:4}}/>
      <Chatbox {...{userData, active, sendTarget, sendText, db, sendValue, setSendValue, inbox, setInbox}}/>
    </Box>
  </>
}
  