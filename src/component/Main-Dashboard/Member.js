import React, { useEffect, useState } from 'react'
// Firebase 
import { useAuth } from '../../context/AuthContext.js'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase.js';
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { Button } from 'react-bootstrap';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/system';
import { List, ListItem, ListItemIcon, ListItemText, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { Female as FemaleIcon, Male as MaleIcon } from '@mui/icons-material';
import LinearProgress from '@mui/material/LinearProgress';
import moment from 'moment';

export default function Member() {
    const toLogin = "/"
    const toManageHG = '/manageHg'
    const toAttendance = '/attendance'
    const toConnectionError = "/errorInternet"
    const navigate = useNavigate();
    const { currentUser } = useAuth()
    const isMobile = window.innerWidth < 768;
    const [loading, setLoading] = useState(true);

    const zoneList = sessionStorage.getItem("zoneList") && sessionStorage.getItem("zoneList").split(",")
    const zoneBgColors = JSON.parse(sessionStorage.getItem("zoneBgColors"))

    // Table Col
    const columns = [
        // { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'name',
            headerName: 'Name',
            width: 200,
        },
        {
            field: 'gender',
            headerName: 'Gender',
            width: 90,
        },
        {
            field: 'dob',
            headerName: 'Birthday',
            width: 90,
        },
        {
            field: 'age',
            headerName: 'Age',
            width: 90,
        },
        {
            field: 'baptism',
            headerName: 'Baptism',
            width: 90,
        },
        {
            field: 'phase',
            headerName: 'Phase',
            width: 200,
        },
        {
            field: 'group',
            headerName: 'Group',
            width: 150,
        },
        {
            field: 'zone',
            headerName: 'Zone',
            width: 150,
        },
    ];
    // Table Row
    const [rows, setRows] = useState([])

    const [isAdmin, setIsAdmin] = useState(false)
    const [selectedZone, setSelectedZone] = useState("")
    const [groupKvs, setGroupKvs] = useState({})

    useEffect(() => {
        getAccess(currentUser.email);
        getData()
    }, []);

    async function getAccess(email) {
        try {
            const docSnap = await getDoc(doc(db, "Whitelist", email));
            if (docSnap.exists()) {
                var v = docSnap.data()
                // Set Admin
                if (v.admin != undefined && v.admin) { setIsAdmin(true); }
                setSelectedZone(v.zone)
            } else {
                navigate(toLogin)
                alert("Invalid Access to Member.js!");
            }
        } catch (error) {
            console.error(error);
            navigate(toConnectionError)
        }
    }
    async function getGroupKvs() {
        // Get Groups Id and Names
        const q = query(collection(db, "Group"), orderBy("zone"), orderBy("name"));
        const querySnapshot = await getDocs(q);

        var object = {}

        querySnapshot.forEach((doc) => {
            object[doc.id] = {
                name: doc.data().name,
                zone: doc.data().zone,
                members: []
            }
        });
        return object
    }
    async function getData() {
        try {
            var objects = await getGroupKvs()

            const q = query(collection(db, "Member"), orderBy("zone"), orderBy("group"), orderBy("role", "desc"), orderBy("name"));
            const querySnapshot = await getDocs(q);

            resetMembers()

            var result = []
            querySnapshot.forEach((doc) => {
                var v = doc.data();

                var objItem = {
                    id: doc.id,
                    name: v.name,
                    gender: v.gender == 1 ? "Male" : "Female",
                    dob: v.dob && moment(v.dob, "YYYY-MM-DD").format("MM-DD"),
                    age: v.dob && moment().year() - moment(v.dob, "YYYY-MM-DD").year(),
                    baptism: v.baptism,
                    phase: v.phase,
                    role: v.role,
                    group: objects[v.group] && objects[v.group].name,
                    zone: v.zone
                }
                result.push(objItem)
                var memberList = []
                if (objects[v.group])
                    memberList = objects[v.group].members
                memberList.push(objItem)
            });
            setRows(result);
            setGroupKvs(objects);
            setLoading(false)
        } catch (error) {
            console.error(error);
            alert("Failed to get document because the client is offline. Please check your internet connection and try again.");
        }
    }
    const resetMembers = () => {
        setGroupKvs({});
    };
    const handleZoneSelectionChange = (event) => {
        setSelectedZone(event.target.value)
    };
    const gotoManageHG = () => {
        navigate(toManageHG);
    }
    const gotoAttendence = () => {
        navigate(toAttendance);
    }
    return (
        <div>
            {
                loading ?
                    <LinearProgress color="inherit" />
                    :
                    currentUser ?
                        <>
                            <Button className="mb-3" variant='secondary' onClick={gotoManageHG}>Manage HG</Button>
                            <Button className="ml-3 mb-3" variant='secondary' onClick={gotoAttendence}>Submit Attendance</Button>

                            {isMobile ?
                                <>
                                    <RadioGroup
                                        row
                                        aria-labelledby="row-radio-buttons-group-label"
                                        name="row-radio-buttons-group"
                                        value={selectedZone}
                                        onChange={handleZoneSelectionChange}
                                    >
                                        {
                                            zoneList.map(zone => {
                                                return <FormControlLabel hidden={isAdmin == false && zone != selectedZone} key={"radio-" + zone} value={zone} control={<Radio />} label={zone.substring(0, 1)} />
                                            })
                                        }
                                    </RadioGroup>
                                    {
                                        Object.keys(groupKvs).map((keyname) => {

                                            return groupKvs[keyname].zone == selectedZone ?
                                                <List key={"List-Group-" + groupKvs[keyname].name}
                                                    style={{ backgroundColor: zoneBgColors[groupKvs[keyname].zone] }}
                                                    className="mb-3"
                                                    dense={false}>
                                                    {
                                                        groupKvs[keyname].members.map((item) => {
                                                            return <ListItem key={"list-item-" + item.id}
                                                                secondaryAction={
                                                                    <ListItemText>
                                                                        {groupKvs[keyname].name}
                                                                    </ListItemText>
                                                                }
                                                            >
                                                                <ListItemIcon>
                                                                    {
                                                                        item && item.gender == "Male" ?
                                                                            <MaleIcon style={{ color: "#2986CC" }} />
                                                                            :
                                                                            <FemaleIcon style={{ color: "#C90076" }} />
                                                                    }
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={item && item.role == 1 ? item.name : <strong>{item.name.toUpperCase()}</strong>}
                                                                    secondary={item && item.dob + ", " + item.age + ", " + item.phase}
                                                                />
                                                            </ListItem>
                                                        })
                                                    }
                                                </List>
                                                :
                                                null

                                        })
                                    }
                                </>
                                :
                                <Box sx={{ height: '400px', width: '100%' }}>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        pageSize={5}
                                        rowsPerPageOptions={[5]}
                                    />
                                </Box>
                            }
                        </>
                        :
                        <>Invalid Access</>
            }
        </div>
    )
}
