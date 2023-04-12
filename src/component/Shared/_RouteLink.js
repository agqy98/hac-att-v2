import React from 'react'
import { List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material'
export default function _RouteLink() {
    const linkList = {
        "member": "Member",
        "guest": "Guest"
    }
    const linkList_Mgt = {
        "manageAccess": "Manage Access",
        "manageGroups": "Manage Groups",
        "manageParameter": "Manage Parameter"
    }
    const linkList_Req = {
        "reqnewhgl": "New HGL",
        "reqmergehg": "Merge HG",
        "reqtransfermember": "Transfer Member",
        "reqprioritybooking": "Priority Booking"
    }
    const linkList_myacc = {
        "myAccount": "My Account"
    }


    const goto = (key) => {
        window.location.href = '/' + key;
    }
    return (
        <>
            <List>
                {
                    Object.entries(linkList).map((t, k) => (
                        <ListItem key={k} disablePadding>
                            <ListItemButton onClick={() => goto(t[0])}>
                                <ListItemText primary={t[1]} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
            <Divider />
            <List>
                <ListItem key="" disablePadding>
                    <ListItemButton disabled>
                        <ListItemText primary="Manage" />
                    </ListItemButton>
                </ListItem>
                {
                    Object.entries(linkList_Mgt).map((t, k) => (
                        <ListItem key={k} disablePadding>
                            <ListItemButton onClick={() => goto(t[0])}>
                                <ListItemText primary={t[1]} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
            <Divider />
            <List>
                <ListItem key="" disablePadding>
                    <ListItemButton disabled>
                        <ListItemText primary="Request" />
                    </ListItemButton>
                </ListItem>
                {
                    Object.entries(linkList_Req).map((t, k) => (
                        <ListItem key={k} disablePadding>
                            <ListItemButton onClick={() => goto(t[0])}>
                                <ListItemText primary={t[1]} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
            <Divider />
            <List>
                {
                    Object.entries(linkList_myacc).map((t, k) => (
                        <ListItem key={k} disablePadding>
                            <ListItemButton onClick={() => goto(t[0])}>
                                <ListItemText primary={t[1]} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>

        </>
    )
}
