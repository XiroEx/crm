import { Backdrop, Box, Button, CircularProgress, Dialog, 
    DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

export default function AddBilling({ addBilling, userData, createBilling }) {
    const [value, setValue] = useState('')
    const [open, setOpen] = useState(false)
    return <>
    <Dialog open fullWidth>
        <DialogTitle> Add Billing </DialogTitle>
        <DialogContent>
            Set up this account as a billing account or add an existing 
            billing account by entering it's connected email below.
            <Box sx={{textAlign:'center', m:3}}>
                <Button variant='contained' onClick={()=>{
                    setOpen(true)
                    createBilling().then(r=>{
                        setOpen(false)
                        alert(r.data.message)
                    })
                }}>Use This Account</Button>
            </Box>
            <TextField placeholder="billing email" variant="outlined" fullWidth
                size="small" autoComplete='off' value={value}
                onChange={(e)=>setValue(e.target.value)}/>
            <Box sx={{textAlign:'center', m:2}}>
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
            </Box>
        </DialogContent>
    </Dialog>
    <Backdrop open={open}><CircularProgress/></Backdrop>
    
    </>
}





