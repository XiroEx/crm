import { Box, CircularProgress } from '@mui/material';
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const stripe = new window.Stripe('pk_test_51L3UanHLtKSOneliQvjch6jVAju15OgD1EFHZ2I83TkWzdeSEGcHFOti8sAyjCNsrpQObdbQn1RAdwmXUOrpd0P400rKIjfnZe')

export default function({
  
}) {
  const navigate = useNavigate()
  const params = useParams()
  
  if (params.id)
    stripe.redirectToCheckout({sessionId: params.id}).catch(e=>{
      alert('Something went wrong, please try again')
      window.close()
    })

  
  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}>
    <Box sx={{m:'auto',mt:5, textAlign:'center', padding:5, maxWidth:'800px'}}> 
      <CircularProgress />
    </Box>
  </Box>
}
  