import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";

export default function({open, setOpen, db, userData, sendValue, active, sendTarget, setSendTarget, setSendValue}) {

    const [confirm, setConfirm] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [number, setNumber] = useState(active)
    const [tags, setTags] = useState(false)
    const [date, setDate] = useState(new Date(Math.floor(Date.now()/900000)*900000+900000*5).getTime())

    async function schedule() {
        const message = {
            body : sendValue,
            targets : sendTarget,
            date : date,
            from : active
        }
        if (repeat) message.repeat = repeat
        await addDoc(collection(db, `users/${userData.id}/scheduled`), message)
    }
    console.log(sendTarget.length)

    return <>
        <Dialog fullWidth open={open} onClose={()=>setOpen(false)}>
            <DialogTitle>Schedule a message</DialogTitle>
            <DialogContent>
                <h4>Message</h4>
                    <TextField InputProps={{sx:{color:sendValue.length > 160 ? 'red':'',}}} dense size='small' fullWidth multiline maxRows={5} value={sendValue} onChange={(e)=>setSendValue(e.target.value)}/>
                <h4>Time & Date</h4>
                    
                <h4>From</h4>
                    <Select defaultValue={number} label="number" onChange={()=>setNumber(number)}>
                        {userData.numbers.map(number=>(<MenuItem value={number}>{number}</MenuItem>))}
                    </Select>
                <h4>To</h4>
                    {!tags && <Button variant='contained' onClick={()=>alert('Soon')}>Choose Tags</Button>}
                    {(sendTarget.length > 0 || tags) && <p>{tags || sendTarget.length > 1 ? `${sendTarget[0].name || sendTarget[0]} +${sendTarget.length - 1} more` : sendTarget[0].name || sendTarget[0]}</p>}
            </DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={()=>setConfirm(true)}>Schedule</Button>
            </DialogActions>
        </Dialog>
        <Dialog fullWidth open={confirm} onClose={()=>setConfirm(false)}>
            <DialogTitle>Schedule this message?</DialogTitle>
            <DialogContent>
                <h4>Message</h4>
                <p>{sendValue}</p>
                <h4>From</h4>
                <p>{active}</p>
                <h4>To</h4>
                {(sendTarget.length > 0 || tags) && <p>{tags || sendTarget.length > 1 ? `${sendTarget[0].name || sendTarget[0]} +${sendTarget.length - 1} more` : sendTarget[0].name || sendTarget[0]}</p>}
            </DialogContent>
            <DialogActions>
                <Button variant='contained' onClick>Confirm</Button>
            </DialogActions>
        </Dialog>
    
    </>
}