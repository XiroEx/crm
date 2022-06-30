import { Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Input, MenuItem, Select, TextField } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { formatNumber } from "../functions/extractnumbers";

export default function({open, setOpen, db, userData, sendValue, active, sendTarget, setSendTarget, setSendValue}) {

    const [confirm, setConfirm] = useState(false)
    const [repeat, setRepeat] = useState(false)
    const [repeatName, setRepeatName] = useState('Daily')
    const [number, setNumber] = useState(active)
    const [tags, setTags] = useState(false)
    const [date, setDate] = useState(Math.floor(Date.now()/900000)*900000+900000*5)

    async function schedule() {
        let sendT = []
        let Tags = []
        sendTarget.forEach( t => {
          if (userData.tags.includes(t)) {
            Tags.push(t)
          } else sendT.push(t.num ? formatNumber(t.num) : formatNumber(t))
        })
        const message = {
            body : sendValue,
            targets : sendT,
            date : date,
            from : active,
        }
        if (repeat) message.repeat = repeat
        if (Tags.length > 0) message.tags = Tags
        await addDoc(collection(db, `users/${userData.id}/scheduled`), message)
        setConfirm(false)
        setRepeat(false)
        setRepeatName('Daily')
        setDate(Math.floor(Date.now()/900000)*900000+900000*5)
        setSendTarget([])
        setSendValue('')
    }

    async function changeRepeat(e) {
        let n = 0, name = ''
        switch(e.target.value) {
            case 'day' : {
                n = 60000*60*24
                name = 'Daily'
                break;
            }
            case 'week' : {
                n = 60000*60*24*7
                name = 'Weekly'
                break;
            }
            case 'biweek' : {
                n = 60000*60*24*14
                name = 'BiWeekly'
                break;
            }
            case 'month' : {
                let newD = new Date(date)
                newD.setMonth(newD.getMonth()+1)
                n = newD.getTime() - date
                name = 'Monthly'
                break;
            }
            case 'quarter' : {
                let newD = new Date(date)
                newD.setMonth(newD.getMonth()+3)
                n = newD.getTime() - date
                name = 'Quarterly'
                break;
            }
            case 'semi' : {
                let newD = new Date(date)
                newD.setMonth(newD.getMonth()+6)
                n = newD.getTime() - date
                name = 'SemiAnnually'
                break;
            }
            case 'annual' : {
                let newD = new Date(date)
                newD.setFullYear(newD.getFullYear()+1)
                n = newD.getTime() - date
                name = 'Annually'
                break;
            }
        }
        setRepeat(n)
        setRepeatName(name)
    }

    return <>
        <Dialog fullWidth open={open} onClose={()=>setOpen(false)}>
            <DialogTitle>Schedule a message</DialogTitle>
            <DialogContent>
                <h4>Message</h4>
                    <TextField InputProps={{sx:{color:sendValue.length > 160 ? 'red':'',}}} dense size='small' fullWidth multiline maxRows={5} value={sendValue} onChange={(e)=>setSendValue(e.target.value)}/>
                <h4>Time & Date</h4>
                    <Input type="datetime-local"  step="900" value={fixTime(date)} onChange={(e)=>{
                        setDate(Math.round((new Date(e.target.value)).getTime() / 900000) * 900000)
                    }}/> - Rounded to nearest 15th minute.
                <h4>From</h4>
                    <Select defaultValue={number} label="number" onChange={()=>setNumber(number)}>
                        {userData.numbers.map(number=>(<MenuItem value={number}>{number}</MenuItem>))}
                    </Select>
                <h4>To</h4>
                    {sendTarget.length > 0 && <p>{sendTarget.length > 1 ? `${sendTarget[0].name || userData.tags?.includes(sendTarget[0]) ? `Tag - ${sendTarget[0]}` : sendTarget[0]}   +${sendTarget.length - 1} more` : sendTarget[0].name || userData.tags?.includes(sendTarget[0]) ? `Tag - ${sendTarget[0]}` : sendTarget[0]}</p>}
                    <Button variant='contained' onClick={()=>alert('Soon, use sendbox for now')}>Add Tags</Button>
            </DialogContent>
            <DialogActions>
                {repeat && <Select defaultValue='day' onChange={changeRepeat}>
                    <MenuItem value='day'>Daily</MenuItem>
                    <MenuItem value='week'>Weekly</MenuItem>
                    <MenuItem value='biweek'>BiWeekly</MenuItem>
                    <MenuItem value='month'>Monthly</MenuItem>
                    <MenuItem value='quarter'>Quarterly</MenuItem>
                    <MenuItem value='semi'>Semiannual</MenuItem>
                    <MenuItem value='annual'>Annually</MenuItem>
                </Select>}
                <>Repeat? <Checkbox checked={!!repeat} onClick={()=>{!repeat ? setRepeat(60000*60*24) : setRepeat(false)}}/></>
                <Button variant='contained' disabled={sendValue == '' || sendTarget.length == 0} onClick={()=>setConfirm(true)}>Schedule</Button>
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
                {repeat && <>
                    <h4>Repeat</h4>
                    <p>{repeatName}</p>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant='contained' onClick={schedule}>Confirm</Button>
            </DialogActions>
        </Dialog>
    
    </>
}

function fixTime(value) {
    const offset = new Date().getTimezoneOffset() * 1000 * 60
    const offsetDate = new Date(value).valueOf() - offset
    const date = new Date(offsetDate).toISOString()
    return date.substring(0, 16)
}