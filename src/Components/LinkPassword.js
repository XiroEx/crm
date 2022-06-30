import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from "@mui/material"
import { EmailAuthProvider, getRedirectResult, linkWithCredential } from "firebase/auth"
import { useEffect, useState } from "react"
import GoogleButton from "react-google-button"
import { useLocation, useNavigate } from "react-router-dom"

export default function({link, setLink, linkPassword}) {
    const [loading, setLoading] = useState(false)
    const [pass, setPass] = useState('')
    const [confirmPass, setConfirmPass] = useState('')

    function linkAccount() {
        if (pass !== confirmPass) {
          alert("Passwords don't match")
          return
        } else {
            if (pass.length < 7) {
                alert("Password must be 7 characters")
                return
            } else {
                linkPassword(link, pass)
            }
        } 
    }

    return <Dialog fullWidth open={!!link} onClose={()=>setLink(false)}>
        <DialogTitle>Link Password</DialogTitle>
        <DialogContent>
            You have previously logged in with Google, fill out the form below to sign in and link a password.<br/><br/>
            <form id="savepassword" onSubmit={(e)=>{e.preventDefault(); linkAccount()}}>
                <TextField variant="outlined" type='password' placeholder="Password" fullWidth margin="dense" size="small" onChange={(e)=>setPass(e.target.value)} value={pass}/>
                <TextField variant="outlined" type='password' placeholder="Confirm Password" fullWidth margin="dense" size="small" onChange={(e)=>setConfirmPass(e.target.value)} value={confirmPass}/>
            </form>
        </DialogContent>
        <DialogActions>
            <GoogleButton type="submit" form="savepassword" style={{margin:'auto', marginBottom:20}} onClick={linkAccount}/>
        </DialogActions>
        <Backdrop open={loading}><CircularProgress/></Backdrop>
    </Dialog>
}

export function SetPassword({auth}) {
    const {state} = useLocation()
    const navigate = useNavigate()
    useEffect(()=>{
        if (state) {
            alert(state)
            const {email, pass} = state
            const credential = EmailAuthProvider.credential(email, pass)
            linkWithCredential(auth.currentUser, credential).then(u=>{
                alert('Password Saved')
                navigate('/send')
            }).catch(e=>{
                alert('Password Error')
                console.log(e)
                navigate('/')
            })
        }
    }, [state])
    return <Backdrop open={true}><CircularProgress/></Backdrop>
}