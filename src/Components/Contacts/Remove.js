import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function({info, setInfo, contact, userData, db, confirm, setConfirm}) {

    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function Remove() {
        setLoading(true)
        const data = info.data
        const docRef = doc(db, `users/${userData.id}/contacts`, contact.id)
        await updateDoc(docRef, {[data.body? 'notes':'numbers']:arrayRemove(data)})
        setInfo(false)
        setLoading(false)
    }
    return <>  
        
        <Dialog fullWidth open={confirm} onClose={()=>setConfirm(false)}>
            <DialogTitle>
                {info.data?.body ? 'Delete Note?': 'Delete Number?'}
            </DialogTitle>
            <DialogContent>
                {info.data?.body ? new Date(info.data.date).toLocaleString() : info.data}
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='primary' onClick={()=>setConfirm(false)}>Cancel</Button>
                <Button variant='contained' color='error' onClick={Remove}>Delete</Button>
            </DialogActions>
        </Dialog>

        <Backdrop open={loading}><CircularProgress/></Backdrop>
    </>
}