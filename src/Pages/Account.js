import { TextField } from "@material-ui/core";
import { AddCircle, Check, Close, Delete, SwapHoriz } from "@mui/icons-material";
import { Backdrop, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, List, ListItem, Snackbar } from "@mui/material";
import { collection, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";

const stripe = new window.Stripe('pk_test_51L3UanHLtKSOneliQvjch6jVAju15OgD1EFHZ2I83TkWzdeSEGcHFOti8sAyjCNsrpQObdbQn1RAdwmXUOrpd0P400rKIjfnZe')

export function Account({
  userData, active,
  db, getNumbers,
  buyNumber, setInbox,
  createCheckout, transferCredits,
  logOut
}) {
  const [snack, setSnack] = useState(false)
  const [buy, setBuy] = useState(false)
  const [numbers, setNumbers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [billData, setBillData] = useState(false)
  const [account, setAccount] = useState(false)
  const [activate, setActivate] = useState(false)
  const [transfer, setTransfer] = useState(false)
  const [confirmCredits, setConfirmCredits] = useState(false)
  const [credits, setCredits] = useState(100)
  const [amount, setAmount] = useState(1000)
  const SOON = "coming soon\ncontact us on discord to add & delete numbers"
  const ONLY = "cannot delete only number"

  const isBilling = userData.billing == userData.id

  function fActivate(e){
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
  
  useEffect(()=>{
   if (userData.numbers.length == 0) getNums('516')
  },[])

  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
    {isBilling && <Billing {...{userData, db, setBillData}}/>}
    <Box sx={{maxWidth:'800px', m:'auto', mt:3, width:'100%'}}>
      <Grid container spacing={1}>
        <Grid item xs={12} sx={{textAlign:'center'}}>
          <Button variant='contained' sx={{m:1}} onClick={()=>{
            const windowRef = window.open("http://crm.georgeanthony.net/checkout","_blank") 
            setLoading(true)
            createCheckout({sub:true}).then(response => {
              windowRef.location = `https://crm.georgeanthony.net/checkout/${response.data.id}`
              setLoading(false)
            })
          }}>Add a Pro Subscription</Button>
        </Grid>
        <Grid item xs={12} sx={{textAlign:'center'}}>
          Buy <TextField variant='standard' value={`${(amount*1).toLocaleString("en-US")}`} onChange={e=>{
              let num = e.target.value.replace(/,/g,'')
              if (!isNaN(num))
                setAmount(num)
            }} inputProps={{sx:{textAlign:'center', color:'white', fontSize:{xs:'14pt',md:'20pt'}, p:0}}} 
            margin='dense' size='small'
            sx={{width: `${((amount*1).toLocaleString("en-US").length)*14}px`,
            minWidth:'28px', mt:0, '& .MuiInputBase-root':{background:'inherit',}}}/> Credits <br/> 
            For <TextField variant='standard'
            value={`$${(amount*.02).toLocaleString("en-US")}`} onChange={e=>{
              let num = e.target.value.replace(/,/g,'').replace(/\$/g,'')
              if (!isNaN(num) && num%1 == 0)
                setAmount(num/.02)
            }}
            inputProps={{sx:{textAlign:'center', color:'white', fontSize:{xs:'14pt',md:'20pt'}, p:0}}} margin='dense' size='small'
            sx={{width: `${(((amount*.02).toLocaleString("en-US").length+1.5))*14}px`, minWidth:'24px', mt:0, '& .MuiInputBase-root':{background:'inherit',}}}/><br/>
          <Button variant='contained' sx={{m:1, color:!(amount%100==0) ? 'red' : 'inherit'}} disabled={!(amount%100==0)} onClick={()=>{
            setLoading(true)
            createCheckout({amount:amount}).then(response => {
              stripe.redirectToCheckout({sessionId: response.data.id})
              setLoading(false)
            })
          }}>{`Buy ${amount} Credits`}</Button>
          {!(amount%100==0) && <p style={{fontSize:'40%', color:'red'}}>Enter Multiples of 100</p> }
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          Billing
        </Grid>
        <Grid item xs={12}>
          <List sx={{width:'100%', maxWidth:'800px', m:'auto', textAlign:'center'}}>
            {!isBilling && <ListItem button onClick={()=>{
                alert(`Billing is ${userData.active ? 'active' : 'inactive'}.`)
              }} 
              secondaryAction={<IconButton sx={{color:'#fff'}}
                onClick={(e)=>{
                  e.stopPropagation()
                  alert(`Coming soon. Contact support to change billing account.`)
                }}><SwapHoriz/></IconButton>}>
                <Grid container>
                  <Grid item xs={2}>
                    {userData.active ? <Check color='primary' onClick={fActivate}/> : 
                      <Close color='error' onClick={fActivate}/>}
                  </Grid>
                  <Grid item xs={10}>
                    {userData.billmail}
                  </Grid>
                </Grid>
            </ListItem>}
            {isBilling && billData && billData.accounts.map( data =>(
              <ListItem button onClick={()=>setAccount(data)}>
                <Grid container>
                  <Grid item xs={2}>
                    {data.active ? <Check color='primary' onClick={fActivate}/> : 
                      <Close color='error' onClick={fActivate}/>}
                  </Grid>
                  <Grid item xs={10}>
                    {data.email}
                  </Grid>
                </Grid>
              </ListItem>
            ))}
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
    <Dialog open={!!numbers || userData.numbers.length == 0} fullWidth onClose={()=>setNumbers(false)}  sx={{textAlign:'center'}}>
      <DialogTitle>Buy a number</DialogTitle>
      <DialogContent>
        {(numbers && numbers.length > 0) ? numbers.map(n=>(
            <Chip color='primary' label={n.phoneNumber} sx={{m:.2}} onClick={()=>setBuy(n.phoneNumber)}/>
        )) : 'No numbers available. Try a different area code.'}
        <br/><br/>Area Code<br/>
        <TextField dense size="small" type='number' sx={{width:'56px', pt:.5, '& .MuiInputBase-root':{background:'white'}}} 
          defaultValue = {userData.numbers[0]?.substring(2,5) || '516'}
          onChange={(e)=>{
            if (e.target.value.length == 3) {
              getNums(e.target.value)
            }
          }}/><br/><br/>
          Each number incurs a $2 inital & monthly charge to billing account
        {userData.numbers?.length == 0 && <Box sx={{mt:2}}><Button onClick={logOut}>Sign Out</Button></Box>}
      </DialogContent>
    </Dialog>

    <Dialog open={!!buy} fullWidth onClose={()=>setBuy(false)}>
      <DialogTitle>{`Buy ${buy}?`}</DialogTitle>
      <DialogActions>
        <Button variant='contained' onClick={()=>setBuy(false)}>Cancel</Button>
        <Button variant='contained' onClick={()=>buyNum()}>Confirm</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={!!account} fullWidth onClose={()=>setAccount(false)}>
      <DialogTitle>{`${account.email}`}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid container item xs={6} spacing={1} sx={{textAlign:'center'}}>
            <Grid item xs={12}>{`${account.active ? 'ACTIVE' : 'INACTIVE'}`}</Grid>
            <Grid item xs={12}>
              <Button variant='outlined' onClick={()=>setActivate(true)}>
                {`${!account.active ? 'Activate' : 'Deactivate'}`}
              </Button>
            </Grid>
          </Grid>
          <Grid container item xs={6} spacing={1} sx={{textAlign:'center'}}>
            <Grid item xs={12}>Credits: {account.credits || 0}</Grid>
            <Grid item xs={12}>
              <Button variant='outlined' onClick={()=>setTransfer(true)}>
                Add/Remove
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Button variant='contained' color='error' onClick={()=>setAccount(false)}>Remove</Button>
          </Grid>
          <Grid item xs={10} sx={{textAlign:'right'}}>
              <Button variant='contained' onClick={()=>setAccount(false)} sx={{mr:1}}>Cancel</Button>
              <Button variant='contained' onClick={()=>{alert('activate');setActivate(false)}}>Confirm</Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>

    <Dialog open={activate} fullWidth onClose={()=>setActivate(false)}>
      <DialogTitle>{`${!account.active ? 'Activate' : 'Deactivate'} Pro Subscription for ${account.email}?`}</DialogTitle>
      <DialogActions>
        <Button variant='contained' onClick={()=>setActivate(false)} sx={{mr:1}}>Cancel</Button>
        <Button variant='contained' onClick={()=>{alert('activate');setActivate(false)}}>Confirm</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={transfer} fullWidth onClose={()=>setTransfer(false)}>
      <DialogTitle>Transfer Credits</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{textAlign:'center'}}>
          <Grid item xs={12}>
            {`Available Credits : ${userData.credits}`}
          </Grid>
          <Grid item xs={4}>
            <TextField dense size="small" type='number' sx={{width:'96px', '& .MuiInputBase-root':{background:'white'}}} 
            defaultValue={100} onChange={(e)=>{setCredits(e.target.value)}}/>
          </Grid>
          <Grid item xs={4}>
            <Button variant='outlined' onClick={()=>{setCredits(Math.abs(credits)*-1);setConfirmCredits(true)}}>Remove</Button>
          </Grid>
          <Grid item xs={4}>
            <Button variant='outlined' onClick={()=>{setCredits(Math.abs(credits));setConfirmCredits(true)}}>Add</Button> 
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' onClick={()=>setTransfer(false)} sx={{mr:1}}>Cancel</Button>
        <Button variant='contained' onClick={()=>{alert('activate');setTransfer(false)}}>Confirm</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={confirmCredits} fullWidth onClose={()=>setConfirmCredits(false)}>
      <DialogTitle>{`${credits > 0 ? 'Add' : 'Remove'} ${Math.abs(credits)} credits for ${account.email}?`}</DialogTitle>
      <DialogActions>
        <Button variant='contained' onClick={()=>setConfirmCredits(false)} sx={{mr:1}}>Cancel</Button>
        <Button variant='contained' onClick={()=>{setConfirmCredits(false);setTransfer(false);transferCredits({amount:credits, to:account.id})}}>Confirm</Button>
      </DialogActions>
    </Dialog>

    <Backdrop open={loading} sx={{zIndex:'10000'}}><CircularProgress/></Backdrop>
</Box>
}
  
function Billing({userData, db, setBillData}){
  const [billingData, userDataLoading, userDataError, userDataSnapshot] = useDocumentData(doc(db,`/users/${userData.id}`))
  const [accounts, accountsDataLoading, accountsDataError, accountsDataSnapshot] = useCollection(collection(db,`/billing/${userData.id}/accounts`))
  useEffect(() => {
    if (billingData && accounts) {
      const data = {...billingData, accounts: accounts.docs.map(a=>({...a.data(), id:a.id}))}
      data.accounts.sort((a,b) => {
        console.log(a.email == userData.billmail)
        if (a.email == userData.billmail) return -1
        if (b.email == userData.billmail) return 1
        return 0
      })
      console.log(accounts)
      setBillData(data)
    }
  },[billingData, accounts])
  return null
}