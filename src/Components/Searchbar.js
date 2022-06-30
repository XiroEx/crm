
import { Typography, Button, Drawer, Paper, Box,
    List, ListItem, ListItemIcon, ListItemText, 
    Divider, InputBase, IconButton } from '@mui/material';
import { History as MenuIcon, Help as DirectionsIcon, 
  ArrowForwardIos, ChevronRight } from '@mui/icons-material';


export function Search({open, searchTarget, searchString, setSearchString}){
    return(
    <Box
        component="form"
        sx={{ display: 'flex', alignItems: 'center', maxWidth: 600, m:'auto',}}
      >
        <IconButton sx={{ p: '10px' }} color="inherit"  aria-label="menu">
          <MenuIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1, color:'#fff' }}
          placeholder="Search"
          inputRef={(input) => {
            if(input != null && open == 'open') {
               input.focus();
            }
          }}
          inputProps={{ 'aria-label': 'search' }}
          onChange={ data => {
            setSearchString(data.target.value)
          }}
          value={searchString}
        />
        <IconButton color="inherit" type="submit" sx={{ p: '10px' }} aria-label="search">
          <ArrowForwardIos />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton color="inherit" sx={{ p: '10px' }} aria-label="directions">
          <DirectionsIcon />
        </IconButton>
      </Box>)
}