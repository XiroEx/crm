import { Backdrop, Box, Button, CircularProgress, Grid, TextField } from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

export default function({userData, db}) {
    const [value, setValue] = useState(userData.settings?.doubletext || 3)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    async function changeDoubleText(e) {
        console.log(e.target.value)
        if ((e.target.value >= 0 && e.target.value <= 365) || e.target.value == '') {
            setValue(e.target.value)
            setError(false)
        } else setError('Must be between 0 and 365 days')
    }

    async function saveSettings(){
        setLoading(true)
        const docRef = doc(db, `users`, userData.id)
        const settings = {[`settings.doubletext`]:value}
        await updateDoc(docRef, settings)
        setLoading(false)
    }
    return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
        <Box sx={{maxWidth:'800px', m:'auto', mt:3, width:'100%'}}>
            <h4>Double Text Protection</h4>
            <Grid container spacing={1}>
                <Grid item xs={9} sx={{textAlign:'center'}}>
                    Min number of days between mass texts per recipient
                </Grid>
                <Grid item xs={3} sx={{verticalAlign:'center'}}>
                    <TextField type='number' value={value} onChange={changeDoubleText} dense size='small' 
                        inputProps={{sx:{textAlign:'center',}}}
                        sx={{width:'64px','& .MuiInputBase-root':{background:'white'}}}/>

                </Grid>
                {error && <Grid item xs={12} sx={{textAlign:'center'}}>{error}</Grid>}
            </Grid>
            <br/>{(value != userData.settings?.doubletext && value != '') && 
                <Button sx={{float:'right'}} variant='contained' onClick={saveSettings}>Save</Button>}
        </Box>
        <Backdrop open={loading}><CircularProgress/></Backdrop>
    </Box>
    }