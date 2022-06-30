import { Backdrop, Box, CircularProgress, createTheme, Snackbar, ThemeProvider } from '@mui/material';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, signInWithEmailAndPassword, signInWithRedirect, signOut, 
  createUserWithEmailAndPassword, 
  signInWithCredential,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  linkWithCredential} from "firebase/auth";
import { collection, doc, getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import AddBilling from "./Components/AddBilling";
import LinkPassword from './Components/LinkPassword';
import { Nav } from './Components/Nav';
import { Account } from './Pages/Account';
import Checkout from './Pages/Checkout';
import { Contacts } from './Pages/Contacts';
import { Conversations } from './Pages/Conversations';
import Drafts from './Pages/Drafts';
import { Home } from './Pages/Home';
import { Send } from './Pages/Send';
import Settings from './Pages/Settings';
import firebase from './utilities/firebaseconfig.js';

const app = initializeApp(firebase)
const db = getFirestore(app)
const functions = getFunctions(app)
const auth = getAuth(app)

const buildInbox = httpsCallable(functions, 'buildInbox')
const buildConversation = httpsCallable(functions, 'buildConversation')
const addBilling = httpsCallable(functions, 'addBilling')
const createBilling = httpsCallable(functions, 'createBilling')
const getNumbers = httpsCallable(functions, 'getNumbers')
const buyNumber = httpsCallable(functions, 'buyNumber')
const createCheckout = httpsCallable(functions, 'createCheckout')
const transferCredits = httpsCallable(functions, 'transferCredits')
const sendText = httpsCallable(functions, 'send')
/**sendText({
  from:'15162616031',
  to:'6466416470',
  body:'test'
}).then(result => {
  console.log(result)
})*/

const theme = createTheme({
  palette: {
    primary: {
      main : deepPurple[700],
      contrastText: '#fff'
    },
    secondary: {
      main : deepOrange[700]
    },
  }
});

function App() {

  const container = React.useRef()
  const [searchTarget, setSearchTarget] = React.useState([])
  const [sendTarget, setSendTarget] = React.useState([])
  const [sendValue, setSendValue] = React.useState('')
  const [inbox, setInbox] = React.useState(false)
  const [userData, setUserData] = React.useState(false)
  const [active, setActive] = React.useState(false)
  const [link, setLink] = React.useState(false)
  const [user, loading, error] = useAuthState(auth)
  const props = {...{buildInbox, sendText, setSearchTarget, inbox, setInbox, active,
    userData, user, db, sendTarget, setSendTarget, sendValue, setSendValue, getNumbers,
    buyNumber, container, buildConversation, createCheckout, transferCredits, logOut}}

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    signInWithRedirect(auth, provider)
  }
  function signInWithPassword(email, password) {
    const credential = EmailAuthProvider.credential(email, password)
    signInWithCredential(auth, credential).catch(e=>{
      console.log(e.code)
      if (e.code.includes("invalid-email")) alert('User does not exist')
      else if (e.code.includes("wrong-password"))
        fetchSignInMethodsForEmail(auth, email).then(r=>{
          console.log(r)
          if (!r.includes('password')) setLink(email)
          else alert('Incorrect Password')
        }).catch(e=>{
          alert(e.message)
        })
    })
  }
  function linkPassword(email, pass) {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    const credential = EmailAuthProvider.credential(email, pass)
    signInWithPopup(auth, provider).then(r=>{
      linkWithCredential(auth.currentUser, credential).then(u=>{
        alert('Password Saved')
        setLink(false)
      }).catch(e=>{
        alert('Password Error')
        console.log(e)
      })
    })

  }
  function createUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password).catch(e=>{
      if (e.message.includes('already-in-use')) alert('Email is already in use. Sign in with Google & add a password from settings.')
    })
  }
  function logOut() {
    console.log('sign out')
    signOut(auth)
    setUserData(false)
    localStorage.clear()
  }

  React.useEffect(()=>{
    if (userData) {
      console.log(userData)
    }
  },[userData])

  const SOON = <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
    <Box sx={{m:'auto',mt:5, textAlign:'center', padding:5, maxWidth:'800px'}}>Coming Soon</Box>
  </Box>

  return ( 
    <ThemeProvider theme={theme}>
    {loading || (user && !userData) && <Backdrop open><CircularProgress/></Backdrop>}
    {user && <UserData {...props} setUserData={setUserData} setActive={setActive}/>}
    <Box className="App" ref={container} >
      {(!loading && !user) || userData ? <>
        <Nav {...props} extended={true} searchTarget={searchTarget} signOut={logOut} signInWithGoogle={signInWithGoogle}/>
        {userData && <>
          {userData.billing && <Routes>
            <Route path="/send" element ={ <Send {...props}/>}/>
            <Route path="/drafts" element ={ <Drafts {...props}/>}/>
            <Route path="/account" element ={ <Account {...props}/>}/>
            <Route path="/settings" element ={ <Settings {...props}/>}/>
            <Route path="/help" element ={ SOON}/>
            <Route path="/checkout">
              <Route index element={<Checkout />} />
              <Route path=':id' element={<Checkout />}/>
            </Route>
            <Route path="/contacts">
              <Route index element={<Contacts {...props}/>} />
              <Route path=':number' element={<Contacts {...props}/>}/>
            </Route>
            <Route path="/conversations">
              <Route index element={<Conversations {...props}/>} />
              <Route path=':number' element={<Conversations {...props}/>}/>
            </Route>
            <Route path='/error' element = {<Navigate to='/account'/>}/>
            <Route path='/success' element = {<Navigate to='/account'/>}/>
            <Route path='*' element = {<Navigate to={`/${userData.numbers.length == 0 ? 
            'account' : 'send'}`}/>} />
          </Routes>}
          {!userData.billing && <AddBilling { ...{...props, createBilling, addBilling}}/>}
        </>}
        {!user && !loading && <Routes>
          <Route path="/" element ={ <Home {...{signInWithGoogle, signInWithPassword, createUser}}/>}/>
          <Route path='*' element = {<Navigate to='/'/>}/>
        </Routes>}
      </>:<></>}
    </Box>
    <LinkPassword {...{...props, link, setLink, linkPassword}}/>
    </ThemeProvider>
  );
}

export default App;

function UserData({db, user, setUserData, setActive}) {
  const [userData, userDataLoading, userDataError, userDataSnapshot] = useDocumentData(doc(db,`/users/${user.uid}`))
  const [contacts, contactsLoading, contactsError, contactsSnapshot] = useCollection(collection(db,`/users/${user.uid}/contacts`))
  const [scheduled, scheduledLoading, scheduledError, scheduledSnapshot] = useCollection(collection(db,`/users/${user.uid}/scheduled`))
  useEffect(()=>{
    if (userData && contacts && scheduled) {
      let c = contacts.docs.map(doc => ({...doc.data(), id:doc.id}))
      let s = scheduled.docs.map(doc => ({...doc.data(), id:doc.id}))
      c.forEach(cc => {
        if (cc.primary.length == 10) cc.primary = `+1${cc.primary}`
        cc.numbers.forEach((n,i) => {
          if (n.length == 10) cc.numbers[i] = `+1${n}`
        })
      })
      setUserData({...userData, contacts:c, scheduled:s, id:user.uid})
      setActive(userData.numbers[0])
    }
  },[userData, contacts, scheduled])
  return null
}