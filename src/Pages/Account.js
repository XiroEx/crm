import { AddCircle, Check, Close, Delete, SwapHoriz } from "@mui/icons-material";
import { Backdrop, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItem, Snackbar } from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

export function Account({
  userData, active,
  db, getNumbers,
  buyNumber, setInbox,
}) {
  const [snack, setSnack] = useState(false)
  const [buy, setBuy] = useState(false)
  const [numbers, setNumbers] = useState(false)
  const [loading, setLoading] = useState(false)
  const SOON = "coming soon\ncontact us on discord to add & delete numbers"
  const ONLY = "cannot delete only number"

  const isBilling = userData.billing == userData.id

  function activate(e){
      e.stopPropagation()
      if (isBilling)
        alert(`Activate Account?`)
      else
        alert(`Coming soon. Contact support to change billing account.`)
  }


  async function saveActive(n){
    const docRef = doc(db, `users/`, userData.id)
    let nums = userData.numbers.slice()
    nums.splice(nums.indexOf(n),1)
    nums.unshift(n)
    await updateDoc(docRef, {numbers:nums})
    setSnack(n)
    setInbox(false)
  }

  async function getNums(area){
    setLoading(true)
    area = area || userData.numbers[0].substring(2,5)
    getNumbers({area:area}).then(result=>{
      setNumbers(result.data)
      setLoading(false)
    })
  }

  async function buyNum(){
    setLoading(true)
    buyNumber({number:buy,billing:userData.billing}).then(result=>{
      setNumbers(false)
      setBuy(false)
      setLoading(false)
    })
  }
  
  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
    <Box sx={{maxWidth:'800px', m:'auto', mt:3, width:'100%'}}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          Billing
        </Grid>
        <Grid item xs={12}>
          <List sx={{width:'100%', maxWidth:'800px', m:'auto', textAlign:'center'}}>
            <ListItem button onClick={()=>{
                if (isBilling) {
                  alert(`Billing management coming soon`)
                } else alert(`Billing is ${userData.active ? 'active' : 'inactive'}.`)
              }} 
              secondaryAction={isBilling ? <IconButton sx={{color:'#fff'}} 
              onClick={(e)=>{
                e.stopPropagation()
                alert(`Remove Account?`)
              }}>
              <Delete/></IconButton> : <IconButton sx={{color:'#fff'}}
              onClick={(e)=>{
                e.stopPropagation()
                alert(`Coming soon. Contact support to change billing account.`)
              }}><SwapHoriz/></IconButton>}>
                <Grid container>
                  <Grid item xs={2}>
                    {userData.active ? <Check color='primary' onClick={activate}/> : 
                      <Close color='error' onClick={activate}/>}
                  </Grid>
                  <Grid item xs={10}>
                    {userData.billmail}
                  </Grid>
                </Grid>
            </ListItem>
          </List>
        </Grid>
      </Grid>
      <Divider sx={{mb:4, mt:2}}/>   
      <Grid container spacing={1}>
        <Grid item xs={12}>
          Numbers
        </Grid>
        <Grid item xs={12}>
          <List sx={{width:'100%', maxWidth:'800px', m:'auto'}}>
            {userData.numbers.map(n=>(<>
              <ListItem button sx={{width:'100%'}} onClick={(e)=>{
                if (n!=active) saveActive(n)
              }} secondaryAction={userData.numbers.length > 1 ? <IconButton sx={{color:'#fff'}} onClick={(e)=>{e.stopPropagation();alert(userData.numbers.length == 1 ? ONLY : SOON)}}>
                  <Delete/></IconButton> : <></>}>
                <Grid container>
                  <Grid item xs={2}>
                    {n==active ? <Check color='primary'/> : ''}
                  </Grid>
                  <Grid item xs={10}>
                    {n}
                  </Grid>
                </Grid>
              </ListItem>
            </>))}
            <ListItem sx={{justifyContent:'flex-end', pr:0}}><IconButton color="primary" onClick={()=>getNums()}><AddCircle/></IconButton></ListItem>
          </List>
        </Grid>
      </Grid>
    </Box>
    <Snackbar
      anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      open={!!snack}
      autoHideDuration={2000}
      onClose={()=>setSnack(false)}
      message={`${snack} is active`}
    />
    <Dialog open={!!numbers} fullWidth onClose={()=>setNumbers(false)}  sx={{textAlign:'center'}}>
      <DialogTitle>Buy a number</DialogTitle>
      <DialogContent>{(numbers && numbers.length > 0) ? numbers.map(n=>(
          <Chip color='primary' label={n.phoneNumber} sx={{m:.2}} onClick={()=>setBuy(n.phoneNumber)}/>
        )) : 'No numbers avaialble. Try a different area code.'
      }</DialogContent>
      <DialogActions>
        Each number incurs a $2 inital & monthly charge to billing account
      </DialogActions>
    </Dialog>

    <Dialog open={!!buy} fullWidth onClose={()=>setBuy(false)}>
      <DialogTitle>{`Buy ${buy}?`}</DialogTitle>
      <DialogActions>
        <Button variant='contained' onClick={()=>setBuy(false)}>Cancel</Button>
        <Button variant='contained' onClick={()=>buyNum()}>Confirm</Button>
      </DialogActions>
    </Dialog>
    <Backdrop open={loading}><CircularProgress/></Backdrop>
</Box>
}
  