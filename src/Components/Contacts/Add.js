import { Button, Backdrop, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { formatNumber } from "../../functions/extractnumbers";

const validFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im

export default function({userData, add, setAdd, contact, db}){

    const [value, setValue] = useState('')
    const [loading, setLoading] = useState(false)
    const isNumber = add.data == 'numbers'
    const isTag = add.data == 'tags'
    
    async function Add() {
        setLoading(true)
        if (isNumber && !validFormat.test(value)) {
            alert(`invalid phone number`)
        } else if (isNumber && exists(value)) {
            alert(`${value} already exists for contact: ${exists(value)}`)
            setValue('')
        } else {
            const data = isNumber? formatNumber(value): isTag ? value.toLowerCase():{body:value, date:Date.now()}
            const docRef = doc(db, `users/${userData.id}/contacts`, contact.id)
            await updateDoc(docRef, {[add.data]:arrayUnion(data)})
            if(isTag) await updateDoc(doc(db,`users`,userData.id), {tags:arrayUnion(data)})
            setValue('')
            setAdd(false)
        }
        setLoading(false)
    }

    function exists(num) {
        let exists = false
        num = formatNumber(num)
        userData.contacts.forEach(c=>{
            c.numbers.forEach(n=>{
                if (n == num) exists = c.name
                return
            })
        })
        return exists
    }
    const title = `Add a ${isNumber ? 'number' : isTag ? 'tag' : 'note'}`
    const placeholder = (isNumber||isTag)?`add ${isNumber?'number':'tag'} here`:
        'add note text here, date will be automatically marked'

    return <>
        <Dialog fullWidth open={add?.open} onClose={()=>{setAdd(false);setValue('')}}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {isTag && userData.tags?.length > 0 && <> {userData.tags.map(t=>(
                    <Chip label={t} onClick={()=>setValue(t)} sx={{m:.2}}/>
                ))}<br/><br/></>}
                <TextField size='small'  dense fullWidth multiline={!(isNumber||isTag)} minRows={4} placeholder={placeholder}
                    value={value} onChange={e=>setValue(e.target.value)} inputProps={{maxLength:16}}/>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={()=>{setAdd(false);setValue('')}}>Cancel</Button>
                <Button variant='contained' disabled={value == ''} onClick={Add}>Add</Button>
            </DialogActions>
        </Dialog>
        <Backdrop open={loading}><CircularProgress/></Backdrop>
    </>
}