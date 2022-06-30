import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

export default function({save, setSave, value, setValue, userData, db}) {
    const [loading, setLoading] = useState(false)
    async function saveDraft(){
        setLoading(true)
        const docRef = doc(db, `users/`, userData.id)
        await updateDoc(docRef, {drafts:arrayUnion(value)})
        setSave(false)
        setLoading(false)
        setValue('')
    }
    return <Dialog fullWidth open={save} onClose={()=>setSave(false)}>
        <DialogTitle>Save Draft?</DialogTitle>
        <DialogContent>{value}</DialogContent>
        <DialogActions>
            <Button variant='contained' onClick={saveDraft}>Save</Button>
        </DialogActions>
        <Backdrop open={loading}><CircularProgress/></Backdrop>
    </Dialog>
}