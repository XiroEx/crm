import { useState, useRef, useEffect } from 'react';
import { Typography, Button, Drawer, Paper, Box,
    List, ListItem, ListItemIcon, ListItemText, 
    Divider, InputBase, IconButton, Autocomplete, Chip, TextField, useTheme, useMediaQuery, Popper } from '@mui/material';
import { UploadFile as MenuIcon, Schedule as DirectionsIcon, 
  ArrowForwardIos, Add, LensTwoTone } from '@mui/icons-material';
import { formatNumber } from '../functions/extractnumbers';
import Schedule from './Schedule';


  /*let contacts = {
    '11829' : {name:'George Abreu Jr.',num:'5164979806'},
    '23546' : {name:'George Abreu Sr.',num:'6466416470'},
    '16829' : {name:'John Smith',num:'1234567123'},
    '23356' : {name:'John Smith',num:'0875201875'},
    '89051' : {name:'Jo Smithson',num:'0875307975'},
    '01284' : {name:'Howard Smithson',num:'7390284758'},
    '10394' : {name:'Hubert Wolfeschlegelsteinhausenbergerdorff',num:'7390284758'},
  }*/

export function Sendbox({setUpload, setSendTarget, sendTarget, userData, db, sendValue, setSendValue, active}){
  const [state, setState] = useState({
    tempValue : '',
    value : []
  })
  const [wrong, setWrong] = useState(false)
  const [schedule, setSchedule] = useState(false)
  const form = useRef()
  const stateRef = useRef(state)
  const validFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  let contacts = {}
  if (userData) {
    let nums = []
    userData.contacts.forEach(c=>{
      c.numbers.forEach(n=>{
        nums.push({name:c.name, num:n, tags:c.tags})
      })
    })
    nums.forEach((n,i)=>{
      contacts[i] = n
    })
  }

  async function shake() {
    const interval = setInterval(go, 50)
    let px = 6
    function go() {
      form.current.style.marginLeft = `${px}px`
      px = px < 0 ? ((px*-1)-1) : ((px*-1)+1)
      if (px === 1) clearInterval(interval)
    }
  }


  const  options = Object.keys(contacts).filter(con=>{
    const c = contacts[con].name 
    const tags = contacts[con].tags
    return (state.tempValue !='' && 
      (tags?.includes(state.tempValue.toLowerCase()) ||
      c.toLowerCase().includes(state.tempValue.toLowerCase())) &&
      !exists(contacts[con]))
  }).map(c=>(contacts[c])).concat(state.tempValue != '' ? [state.tempValue] : []) //NOW SORT BASED ON FIRST & LASTNAME MATCHES & STARTSWITH
  .sort((a,b) => (a == state.tempValue ? -1 : b == state.tempValue ? 1 : a.name.split(' ')[0].toLowerCase() == state.tempValue.toLowerCase() ? -1 : b.name.split(' ')[0].toLowerCase() == state.tempValue.toLowerCase() ? 1 : a.name.split(' ')[1].toLowerCase() == state.tempValue.toLowerCase() ? -1 : b.name.split(' ')[1].toLowerCase() == state.tempValue.toLowerCase() ? 1 : a.name.startsWith(state.tempValue) ? -1 : b.name.startsWith(state.tempValue) ? 1 : a.name > b.name ? 1 : a.name < b.name ? -1 : 0 ))

  function exists(c) {
    let e = false
    sendTarget.forEach(t=>{
      const num = t.num || t
      const name = t.name || false
      console.log(t)
      if (formatNumber(num) == formatNumber(c.num) && (!name || c.name == t.name)) e = true
    })
    return e
  }

  const theme = useTheme()
  const md= useMediaQuery(theme.breakpoints.up('md'))
  const sm= useMediaQuery(theme.breakpoints.up('sm'))
  const lg= useMediaQuery(theme.breakpoints.up('lg'))

  useEffect(()=>{
    setSendTarget(state.value)
  },[state.value])
   

  return(
  <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 600, m:'auto', overflow:'show'}}>
    <IconButton sx={{ p: '10px' }} color="inherit"  aria-label="menu" onClick={()=>setUpload(true)}>
      <MenuIcon />
    </IconButton>
    <Autocomplete multiple id="send-input" freeSolo sx={{ ml: 1, flex: 1 }}   
      ref={form} limitTags={2} fullWidth
      options={options.map(v=>(typeof v == 'string' ? v : `${v.name} - ${v.num}`))}
      value={sendTarget.map(v=>{ return typeof v == 'string' ? v : sendTarget.length == 1 ? v.name : v.num})}
      renderTags={(value, getTagProps) => {
        const numTags = value.length
        const limitTags = sm ? 2 : 1
        const reversed = JSON.parse(JSON.stringify(value))
        reversed.reverse()
        const tags = reversed.slice(0,limitTags).reverse()
        const nLimit = sm ? 20 : 12
        return (<>
          {tags.map((option, index) => (
            <Chip variant="outlined" label={option.length > nLimit ? `${option.substring(0,nLimit)}...` : option} sx={{color:'#fff'}} {...getTagProps({ index })} />
          ))}
          {numTags > limitTags && ` +${numTags - limitTags}`}
          <Box sx={{ml:0.5}} />
          </>)
      }}
      PopperComponent={props=>(
        <Popper {...props} style={{width:"100%", maxWidth:'600px'}} placement="bottom-start" />
      )}
      onChange={(e, v, r) => {
        if (r != 'removeOption') {
          let val=v[v.length-1]
          if (validFormat.test(val)) {
            const value = [...new Set(sendTarget.concat([formatNumber(val)]))]
            setState({...state, value:value, tempValue:''})
          } else if (r=='clear') {
            setState({...state, value:v, tempValue:''})
          } else {
            val=val.split('-').map(v=>(v.trim()))
            const conts = Object.keys(contacts).filter(c =>(contacts[c].name == val[0] && 
              formatNumber(contacts[c].num) == formatNumber(val[1]))).map(c=>(contacts[c]))[0]
            console.log(conts)
            if (conts && options.includes(conts)) {
              const value = sendTarget.concat([conts])
              setState({...state, value:value, tempValue:''})
            } else {
              shake()
              setWrong(true)
              setTimeout(()=>{
                setWrong(false)
              }, 2500)
            }
          }
        } else {
          let index = 0
          sendTarget.forEach((val,i) => {
            if (!v.includes(typeof val == 'string' ? val : sendTarget.length == 1 ? val.name : val.num))
              index = sm ? i == 0 ? 1 : 0 : i
          })
          let newV = JSON.parse(JSON.stringify(sendTarget))
          newV.splice(newV.length-(1+index), 1)
          if (index == 0 || index == 1) {
            setState({...state, value:newV})
          } else {
            setState({...state, tempValue:''})
          }
        }
      }}
      renderInput={params=>(
        <TextField
          {...params}
          placeholder={wrong ? "Invalid" : "Add numbers, contacts, or tags"}
          value={state.tempValue}
          variant='standard'
          InputProps={{...params.InputProps,sx:{color:'#fff', border:'none'},disableUnderline: true}}
          onKeyDown={e=>{if(e.key === 'Backspace') e.stopPropagation()}}
          onChange={e=>{
            const v = e.target.value
            setState({...state, tempValue:v})
          }}
          onPaste={e=>{
            e.preventDefault()
            const clipboardData = e.clipboardData || window.clipboardData
            const char = clipboardData.getData('Text').includes(',') ? ',' : ' '
            const v = [...new Set(clipboardData.getData('Text').split(char)
              .filter(i=>(validFormat.test(i.trim()))).map(i=>(formatNumber(i))))]
            const value = [...new Set(sendTarget.concat(v))]
            setState({...state, value:value, tempValue:''})

          }}
        />
      )}/>
    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
    <IconButton color="inherit" sx={{ p: '10px' }} aria-label="directions" onClick={()=>setSchedule(true)}>
      <DirectionsIcon />
    </IconButton>
    <Schedule {...{setSendTarget, sendTarget, userData, db, sendValue, setSendValue, active}} open={schedule} setOpen={setSchedule}/>
  </Box>)
}

