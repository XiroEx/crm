import { Box } from "@mui/material";
import React from "react";

export function Dashboard({
  logo
}) {
  return <Box className='App-header' sx={{ml:{lg:'240px'}, maxWidth:{lg:'calc(100vw - 260px)'}}}> 
    <img src={logo} />
  </Box>
}
  