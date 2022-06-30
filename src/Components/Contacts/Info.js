
import { Delete, Send } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Remove from "./Remove";

export default function({info, setInfo, contact, userData, db}) {
    const [confirm, setConfirm] = useState(false)
    
    const navigate = useNavigate()

    return <>  
        <Dialog fullWidth open={info?.open} onClose={()=>setInfo(false)}>
            <DialogTitle>
                {info.data?.body ? new Date(info.data.date).toLocaleString() : `${info.data==contact.primary? 'Primary':'Secondary'} number`}
            </DialogTitle>
            <DialogContent>
                {info.data?.body ? info.data.body : info.data}
            </DialogContent>
            <DialogActions>
                {(info.data?.body || !(info.data == contact.primary)) && 
                <IconButton color='error' onClick={()=>setConfirm(true)}><Delete/></IconButton>}
                {!info.data?.body && 
                <IconButton color='primary' onClick={()=>navigate(`/conversations/${info.data}`)}><Send/></IconButton>}
            </DialogActions>
        </Dialog>

        <Remove {...{ confirm, setConfirm, contact, userData, db, info, setInfo}}/>
    
    </>
}