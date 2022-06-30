import { AddCircle, Delete } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, TextField } from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";

const validFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im

export function AddContact({
  add,
  setAdd,
  db,
  userData
}) {
  const [numbers, setNumbers] = useState([])
  const [primary, setPrimary] = useState('')
  const [name, setName] = useState('')
  const [addNote, setAddNote] = useState(false)
  const [note, setNote] = useState('')
  const [ncounter, setNCounter] = useState(0)
  const [tcounter, setTCounter] = useState(0)
  const [numValues, setNumValues] = useState({

  })

  const vRef = useRef()
  vRef.current = numValues

  const ref = useRef()
  ref.current = numbers

  function addNumbers() {
    const i = ncounter
    setNumbers([...numbers,<TextField
      fullWidth
      id={`number${i}`}
      label="number"
      InputProps={{endAdornment:(<Delete onClick={(e)=>removeNumbers(i)}/>)}}
      placeholder="number"
      value={numValues[`number${i}`]}
      onChange={e=>{setNumValues({...vRef.current, ['number'+i]:e.target.value})}}
      size="small"
      margin="dense"
    />])
    setNCounter(ncounter+1)
    
  }

  function addTag() {
    const i = tcounter
    alert('coming soon, add tags from contacts page for now')
  }

  function removeNumbers(i){
    setNumbers(ref.current.filter(n=>(n.props.id !== `number${i}`)))
    let newNums = JSON.parse(JSON.stringify(vRef.current))
    delete newNums[`number${i}`]
    setNumValues(newNums)
  }

  async function addContact(){
    if(primary == '') alert('Need number')
    else if (!checkNums()) alert('Invalid Number')
    else if (!checkContacts()) alert('Number Already Exists in Contacts')
    else {
      console.log(checkContacts())
      let d = Date.now()
      let contact = {primary:primary, numbers:[primary], last:d, notes:[]}
      if (name != '') contact.name=name
      if (Object.keys(vRef.current).length > 0) Object.keys(vRef.current).forEach(n=>contact.numbers.push(vRef.current[n]))
      if (addNote && note) contact.notes.push({date:d, body:note})
      const docRef = await addDoc(collection(db, `users/${userData.id}/contacts`), contact)
      console.log(docRef.id)
      exit()
    }

    function checkNums() {
      if (!validFormat.test(primary)) return false
      let ex = false
      if (Object.keys(vRef.current).length > 0)
        Object.keys(vRef.current).forEach(n=>{
          if (!validFormat.test(vRef.current[n])) ex = true
        })
      return !ex
    }

    function checkContacts() {
      let nums = [primary]
      Object.keys(vRef.current).forEach(n=>{
        nums.push(vRef.current[n])
      })
      let ex = false
      nums.forEach(n=>{
        n = n.length == 10 ? `+1${n}` : n
        userData.contacts.forEach(c=>{
          c.numbers.forEach(n2=>{
            console.log(n,n2,n == n2)
            if (n == n2) ex = true
          })
        })
      })
      return !ex
    }
  }

  function exit(){
    setAdd(false)
    setNumbers([])
    setPrimary('')
    setName('')
    setNote('')
    setAddNote(false)
    setNumValues({})
    setNCounter(0)
  }

  return <Dialog open={add} onClose={()=>{setAdd(false); setNumbers([])}}>
    <DialogTitle>Add a contact</DialogTitle>
    <DialogContent>
      <Box component="form" noValidate autoComplete="off" onSubmit={(e)=>{alert('submit')}}>
        <TextField
            fullWidth
            value={primary}
            onChange={e=>{setPrimary(e.target.value)}}
            id="primary-number"
            label="number"
            placeholder="primary number"
            size="small"
            margin="dense"
          />
          <TextField
            fullWidth
            value={name}
            onChange={e=>{setName(e.target.value)}}
            id="name"
            label="name"
            placeholder="name"
            size="small"
            margin="dense"
          />
          {numbers}
          {addNote && <TextField
            multiline
            maxRows={4}
            fullWidth
            id={`note`}
            label="note"
            InputProps={{endAdornment:(<Delete onClick={(e)=>setAddNote(false)}/>)}}
            placeholder="note"
            value={note}
            onChange={e=>{setNote(e.target.value)}}
            size="small"
            margin="dense"
          />}
          {!addNote && <Button endIcon={<AddCircle/>} onClick={()=>{setAddNote(true)}}>Note</Button>}
          <Button endIcon={<AddCircle/>} onClick={addNumbers}>Number</Button>
          <Button endIcon={<AddCircle/>} onClick={addTag}>Tag</Button>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={exit}>Cancel</Button>
      <Button onClick={addContact}>Add</Button>
    </DialogActions>
  </Dialog>
}
  