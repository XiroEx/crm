import { Add } from "@mui/icons-material";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Input } from "@mui/material";
import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

export function Timesheet({
  
}) {

  const Ref = useRef(null)
  const Time = useRef(null)
  const [showAdd, setShowAdd] = useState(false)
  const [time, setTime] = useState(0)
  const [end, setEnd] = useState(0)
  const [waste, setWaste] = useState(0)

  useEffect(()=>{
    Time.current = time
    if (Ref.current) clearInterval(Ref.current)
    let timeInterval = setInterval(()=>{setTick()}, 1000)
    Ref.current = timeInterval
  },[])

  function setTick() {
    setWaste(Date.now()-Time.current)
  }

  function clockIn() {
    setShowAdd(true)
    setTime(Date.now())
    setWaste(0)
  }

  const Clock =  (end && end > time) ? ((end-time)/1000).toFixed(0) : time < Date.now() ? ((Date.now()-time)/1000).toFixed(0) : 0

  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}, pb:10}}> 
    <Fab color="primary" sx={{position:'fixed', right:20, bottom:20}} onClick={clockIn}>
      <Add/>
    </Fab>

    <Dialog open={showAdd} onClose={()=>{setShowAdd(false) }} fullWidth>
      <DialogTitle>
        Add Clock-in
      </DialogTitle>
      <DialogContent sx={{textAlign:'center'}}>
        Start : <Input type="datetime-local"  step="60" value={fixTime(time)} onKeyDown={ e => e.preventDefault() } onChange={(e)=>{
          console.log(e.target.value)
          setTime((new Date(e.target.value)).getTime())
        }}/><br/><br/>
        {new Date(Clock * 1000).toISOString().substring(Clock > 86400000 ? 14:11, 19)}<br/><br/>
        <span sx={{textAlign:'left', width:'100%'}}>End :  <Input type='datetime-local' step='60' onKeyDown={ e => e.preventDefault() } value={fixTime(end || Date.now())}
          onChange={ e => { setEnd((new Date(e.target.value)).getTime()) }} /></span><br/><br/>
      </DialogContent>
      <DialogActions>

      </DialogActions>
    </Dialog>
  </Box>
}
  
function fixTime(value) {
  const offset = new Date().getTimezoneOffset() * 1000 * 60
  const offsetDate = new Date(value).valueOf() - offset
  const date = new Date(offsetDate).toISOString()
  return date.substring(0, 16)
}