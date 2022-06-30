import { Backdrop, Button, CircularProgress, Dialog, 
    DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

export default function AddBilling({ addBilling, userData }) {
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    return <>
    <Dialog open fullWidth>
        <DialogTitle> Add Billing Account </DialogTitle>
        <DialogContent>
            Set up this account as a billing account or add an existing 
            billing account by entering it's connected email below.<br/><br/>
            <TextField placeholder="billing email" variant="outlined" fullWidth
                size="small" autoComplete='off' value={value}
                onChange={(e)=>setValue(e.target.value)}/>
        </DialogContent>
        <DialogActions>
            <Button variant='contained'>Use This Account</Button>
            <Button variant='contained' onClick={()=>{
                setOpen(true)
                addBilling({email:userData.email, billing:value})
                .then(r=>{
                    setOpen(false)
                    alert(r.data.message)
                })
            }}
                disabled={value == '' || !value.includes('.') || !value.includes('@')}>
                Use Existing Account
            </Button>
        </DialogActions>
    </Dialog>
    <Backdrop open={open}><CircularProgress/></Backdrop>
    
    </>
}





