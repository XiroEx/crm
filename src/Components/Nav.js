import { AccountCircle, ArrowBack, ChevronLeft, Contacts, Drafts, FileOpen, Help, Inbox as InboxIcon, Menu as MenuIcon, Search as SearchIcon, Send, SendRounded, Settings } from '@mui/icons-material';
import {
    AppBar, Backdrop, Box, Button, CircularProgress, Dialog, Divider, Drawer, Grid, IconButton, Input, List, ListItem, ListItemIcon, ListItemText, Snackbar, Toolbar, Typography, useMediaQuery, useTheme, DialogActions, DialogContent, DialogTitle 
} from '@mui/material';
import React, { useRef } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from './Searchbar';
import { Sendbox } from "./Sendbox";
import extractnumbers, { formatNumber} from "../functions/extractnumbers";

let last = false
export function Nav({auth, searchTarget, logged, user, signOut, setSendTarget, sendTarget, sendValue, setSendValue, userData, active, db}) {
    const location = useLocation()
    const navigate = useNavigate()

    const [loading, setLoading] = React.useState(false)
    const [search, setSearch] = React.useState(false)
    const [searchString, setSearchString] = React.useState('')
    const [snack, setSnack] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [back, setBack] = React.useState(location.pathname.split('/').length > 2)
    const [upload, setUpload] = React.useState(false)
    const handleDrawerToggle = () => {
        setOpen(!open)
    }
    const isFirstRun = useRef(true)
    const theme = useTheme()
    const md= useMediaQuery(theme.breakpoints.up('md'))
    const lg= useMediaQuery(theme.breakpoints.up('lg'))

    const loc = location.pathname.split('/')[1] ? window.location.pathname.split('/')[1].toUpperCase() : undefined
    const param = location.pathname.split('/')[2]
    let contact, primary
    if (userData && param) contact = userData.contacts.filter(c=>(c.numbers.includes(param)))[0]?.name
    
    React.useEffect(()=>{
        setBack(location.pathname.split('/').length > 2)
    },[location])

    React.useEffect(()=>{
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        } else if (userData.lastMessage && (!last || JSON.stringify(last) == JSON.stringify(userData.lastMessage))) {
            last = JSON.stringify(last)
            setSnack(userData.lastMessage)
        }
    },[userData.lastMessage])

    const icons = [<Send/>,<InboxIcon/>,<Drafts/>,<Contacts/>,<AccountCircle/>,<Settings/>, <Help/>]
    const Menu = <>
        <Box><Toolbar>
            <IconButton onClick={handleDrawerToggle} sx={{display:{xs:'block', lg:'none', color:'#fff'}}} >
                <ChevronLeft/>
            </IconButton>
        </Toolbar></Box>
        <Divider />
        <List sx={{width:'240px',}}>
        {['Send', 'Conversations', 'Drafts', 'Contacts'].map((text, index) => (
            <ListItem button key={text} style={{color:'#fff'}} onClick={()=>{navigate(`/${text.toLowerCase()}`); handleDrawerToggle()}}>
                <ListItemIcon  style={{color:'#fff'}} >
                    {icons[index]}
                </ListItemIcon>
                <ListItemText primary={text}/>
            </ListItem>
        ))}
        </List>
        <Divider />
        <List>
        {['Account', 'Settings', 'Help'].map((text, index) => (
            <><Link to={`/${text.toLowerCase()}`} onClick={handleDrawerToggle}><ListItem button key={text} style={{color:'#fff'}}>
            <ListItemIcon style={{color:'#fff'}}>
                {icons[index+4]}
            </ListItemIcon>
            <ListItemText primary={text} />
            </ListItem></Link></>
        ))}
        </List></>

        
    return (<>
        <AppBar position="fixed">
            <Toolbar variant='dense' sx={{minHeight:'56px', ml:{lg:'240px'}}}>
                <IconButton size="large" edge="start" onClick={back ? ()=>navigate(`/${loc.toLowerCase()}`) :handleDrawerToggle} sx={{display:{lg:!back ? 'none' : ''}}} color="inherit" aria-label="menu">
                    {back ? <ArrowBack/>:<MenuIcon/>}
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign:{lg:'left'}, fontVariant:'small-caps' }}
                    onClick={()=>{if(contact) navigate(`/contacts/${param}`)}}>
                    {contact || param && param.length > 15 ? loc : param || loc || 'SampleCRM'}
                </Typography>
                {logged ? <Button color="inherit">Login</Button> : <IconButton color='inherit' onClick={()=>setSearch(search == 'open' ? 'close' : 'open')}><SearchIcon/></IconButton>}
            </Toolbar>
            <Box sx={{ml:{lg:'240px'}}} className={search == 'close'?'scroll-out-top': search == 'open'?'scroll-in-top':'hidden'}>
                <Search searchString={searchString} searchTarget={searchTarget} setSearchString={setSearchString} open={search}/>
            </Box>
            <Box sx={{ml:{lg:'240px'}}} className={(location.pathname.split('/')[1] == 'send' && search !== 'open') ? 'scroll-in-top':'hidden'}>
                {location.pathname.split('/')[1] == 'send' && userData && <Sendbox {...{db, userData, sendTarget, setSendTarget, setUpload, sendValue, setSendValue, active}} />}
            </Box>
        </AppBar>

        <Drawer anchor={'left'} open={open} onClose={handleDrawerToggle} variant='temporary' sx={{display:{xs:'block',lg:'none'}}}
            PaperProps={{sx:{bgcolor:'primary.main'}}}>
            {Menu}      
            {user && <Button sx={{color:'#fff'}} onClick={()=>{signOut(); setOpen(false)}}>Sign Out</Button> }    
        </Drawer>
        <Drawer anchor={'left'} open={true} variant='persistent' sx={{display:{xs:'none',lg:'block',}, fontVariant:'normal', color:'white'}}
            PaperProps={{sx:{bgcolor:'primary.main'}}}>
            {Menu} 
            {user && <Button sx={{color:'#fff'}} onClick={()=>{signOut(); setOpen(false)}}>Sign Out</Button> }    
        </Drawer>

        
        <Backdrop
        sx={{ color: '#fff', pt:'94px', backdropFilter:'blur(80px)', 
        zIndex:1, justifyContent:'inherit', alignItems:'normal', 
        width: { lg: `calc(100% - ${240}px)` }, ml: { lg: `${240}px` },}}
        open={search == 'open'}
        onClick={()=>setSearch('close')} >
            <List sx={{ml:'auto', mr:'auto'}}>
                {['Test', 'Test1', 'Test2'].filter((data, i)=>{return data.includes(searchString) || ipsum[i].includes(searchString)}).map((data, i)=>{
                return <><ListItem button >
                    <Grid container>
                        <Grid container item xs={12}>
                            <Grid item xs={6}><h4 style={{margin:5}}>{data}</h4></Grid>
                            <Grid item xs={6} style={{textAlign:'right'}}><span style={{margin:5}}>3/12/2022</span></Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <p style={{textIndent:'10%', padding:0, margin:0, color:'gray'}}>{(ipsum[i].substring(0,93).concat('...'))}</p>
                        </Grid>
                    </Grid>
                </ListItem><Divider style={{color:'#fff'}}/></>
                })}
            </List>
        </Backdrop>

        <Dialog open={upload} onClose={()=>{setUpload(false)}} fullWidth PaperProps={{sx:{bgcolor:'#282c34', color:'#fff', pb:2}}}>
            <DialogTitle>Upload A File</DialogTitle>
            <DialogContent sx={{textAlign:'center'}}>Upload a spreadsheet or text file & we'll automatically extract any phone numbers they contain.</DialogContent>
            <DialogActions>
                <label htmlFor="upload" style={{margin:'auto'}}>
                    <Input sx={{display:'none'}} type="file" id="upload" accept=".xlsx, .xls, .csv" onChange={(e)=>{
                        setLoading(true)
                        extractnumbers(e.target.files[0]).then(numbers => {
                            setSendTarget(numbers)
                            setLoading(false)
                            setUpload(false)
                        })
                    }}/>
                    <IconButton className='pulse' component="span" sx={{color:'#fff', margin:'auto'}}><FileOpen/></IconButton>
                </label>
            </DialogActions>
        </Dialog>
        {loading && <Backdrop sx={{ color: '#fff', pt:'94px', backdropFilter:'blur(80px)',justifyContent:'inherit', alignItems:'normal', width:'100vw', height:'100vh'}}>
            <CircularProgress />
        </Backdrop>}

        <Snackbar 
            anchorOrigin={{ vertical:'top', horizontal:'right' }}
            open={!!snack}
            autoHideDuration={3000}
            onClose={()=>setSnack(false)}
            message={`${snack.from} ${snack.body}`}
            onClick={()=>{
                navigate(`/conversations/${snack.from}`)
                setSnack(false)
            }}
            sx={{cursor:'pointer'}}
        />
    </>)
}


let ipsum = ['Vestibulum at egestas nisi, maximus faucibus enim. Sed facilisis odio id enim ultrices lacinia. Fusce ut dignissim purus, vel semper diam. Vestibulum accumsan gravida tortor, sit amet posuere elit sagittis blandit. In rutrum ex mi, eu molestie nulla dictum ut. Fusce sagittis eleifend mauris nec dictum. Quisque sagittis elementum mauris, quis ullamcorper sapien semper vitae. Ut iaculis tortor nec lacus facilisis, sit amet pharetra ex convallis.',
'Mauris vitae ipsum viverra, lacinia mauris et, blandit diam. Donec vestibulum, dolor id bibendum mattis, nisl erat mattis mauris, sit amet molestie ligula tellus at tellus. Sed ullamcorper ac enim eget molestie. Curabitur rhoncus lacus at ligula blandit, et bibendum augue dictum.', 'Ut a risus scelerisque, convallis est ac, volutpat quam. Etiam tincidunt nulla at lorem feugiat hendrerit. Quisque nisi orci, ornare sit amet augue id, maximus pharetra tellus. Donec consectetur nibh mauris, quis ultricies urna dignissim scelerisque. Pellentesque condimentum vehicula arcu, et pharetra mauris finibus id. Morbi tincidunt tortor a urna tristique eleifend. Morbi congue vestibulum sodales. Sed faucibus auctor velit, eu blandit ipsum efficitur et. Suspendisse potenti. Cras quam libero, bibendum ut nisi ac, auctor scelerisque quam. In eget fermentum nulla.']
  