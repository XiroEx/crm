import { Add } from "@mui/icons-material";
import { Box, Checkbox, CircularProgress, Fab, FormControlLabel, List, Typography } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chatbox } from '../Components/Chatbox';
import { ConversationButton } from '../Components/ConversationButton';
import { MessageBubble } from '../Components/MessageBubble';

export function Conversations({buildInbox, inbox, setInbox, userData, active, buildConversation,
  sendText, db, sendValue, setSendValue, container}) {
  const navigate = useNavigate()
  const bottom = React.useRef()
  const params = useParams()
  const [messages, setMessages] = React.useState([])
  const [checked, setChecked] = React.useState(true)
  const [coordinates, setCoordinates] = React.useState(false)

  React.useEffect(async ()=>{
    if (!inbox && active) {
      const result = await buildInbox({number:active})
      if (result.data.success) setInbox(result.data.data)
    }
    window.addEventListener('resize', ()=>bottom.current.scrollIntoView(true))
    return window.removeEventListener('resize', ()=>bottom.current.scrollIntoView(true))
  },[])

  React.useEffect(async ()=>{
    if (inbox) {
      let newInbox = JSON.parse(JSON.stringify(inbox))
      let index = false
      newInbox.forEach((n,i)=>{
          if (n.number == userData.lastMessage.from)
            index = i
      })
      if (index === false) newInbox.unshift({
          number: userData.lastMessage.from,
          messages: [{
              sent: false,
              date: userData.lastMessage.date,
              body: userData.lastMessage.body
          }]
      }) 
      else {
        newInbox[index].messages.push({
          date: userData.lastMessage.date,
          body: userData.lastMessage.body,
          sent: false
        })
      }
      setInbox(newInbox)
      if(bottom.current && params.number)
        bottom.current.scrollIntoView(true)
    }
  },[userData.lastMessage])

  React.useEffect(async ()=>{
    if (!inbox && active) {
      const result = await buildInbox({number:active})
      if (result.data.success) setInbox(result.data.data)
    }
  },[active])

  React.useEffect(async ()=>{
    if (bottom.current && params.number)
      bottom.current.scrollIntoView(true)
  },[messages])

  React.useEffect(async ()=>{
    if (bottom.current && params.number){
      buildConversation({number:active, contact:params.number})
        .then(result=>{
          let newInbox = inbox.slice()
          newInbox.forEach((m,i) => {
            if (m.number == params.number) newInbox[i].messages = result.data
          })
          console.log(result.data)
          setInbox(newInbox)
        })
      bottom.current.scrollIntoView(true)
    } else if (coordinates !== false && !params.number) {
      container.current.scrollTop = coordinates
      setCoordinates(false)
    }
  },[params.number])

  React.useEffect(async ()=>{
    if (params.number && inbox) getMessages(params.number)
    if (!inbox) setMessages(false)
  }, [inbox])

  function check() {
    setChecked(!checked)
  }

  function getMessages(n) {
    if(inbox.filter(i=>{return i.number == n}).length !== 0) {
      let m = inbox.filter(i=>{return i.number == n})[0].messages
      setMessages(m)
      if (bottom.current && params.number)
        bottom.current.scrollIntoView(true)
    }
  }

  return <Box className="App-header" sx={{ ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}, pb:10}}>
    
    {params.number && inbox && <>
      <List>
        {messages.length > 0 && messages.map(m => {
          return <>
            <MessageBubble message={m}/>
          </>
        })}
      </List>
      <Box sx={{height:'1vh', m:3}} ref={bottom}/>
      <Chatbox {...{active, sendText, userData, db, sendValue, setSendValue, inbox, setInbox}} sendTarget={[params.number]}/>
    </>}
    {!params.number && inbox && <><List>
      <FormControlLabel key='form' sx={{float:'right'}} labelPlacement='start'
        control={<Checkbox sx={{transform:'scale(.75)'}} checked={checked} onChange={check}/>} 
        label={<Typography sx={{fontSize:12}}>Respondants Only</Typography>}
      />
      {inbox.map((c)=> {
          return <span key={c.number+Math.random()} onClick={()=>{
            getMessages(c.number)
            setCoordinates(container.current.scrollTop)
            navigate(`${c.number}`)
          }}><ConversationButton userData={userData} conversation={c}/></span>
      })}
    </List></>}
    {inbox?.length === 0 && 'No Conversations'}
    {inbox === false && <CircularProgress sx={{margin:'auto', padding:10}}/>}
    
    <Fab color="primary" sx={{position:'fixed', right:20, bottom:20}}>
      <Add/>
    </Fab>
  </Box>
}