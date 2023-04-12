import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment'
import { doc, collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from '../../firebase';
import { Breadcrumb, Row, Col, Form, FormGroup, Card, ButtonGroup, Button } from 'react-bootstrap'
import { LinearProgress, Divider, List, ListItem, ListItemText, TextField, Box, Stepper, Step, StepLabel, Paper, Autocomplete, Grid } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

export default function Attendance() {
    const toLogin = "/"
    const toMember = '/member'
    const toConnectionError = "/errorInternet"

    const dateIdFormat = 'YYYY-MM-DD'
    const navigate = useNavigate();
    const { currentUser } = useAuth()
    const isMobile = window.innerWidth < 768;
    const [loading, setLoading] = useState(true)

    const [dateId, setDateId] = useState("")
    const [thisDateId, setThisDateId] = useState(getThisDateId())
    const [dateIdList, setDateIdList] = useState(getThisDateIdList())

    const [selectedGroup, setSelectedGroup] = useState("")
    const [selectedGroupName, setSelectedGroupName] = useState("")
    const [memberReport, setMemberReport] = useState({})
    const [guestReport, setGuestReport] = useState([])
    const [avreReport, setAvreReport] = useState({})

    const [guestAutocomplete, setGuestAutocomplete] = useState([])
    const [memberAutocomplete, setMemberAutocomplete] = useState([])
    const [inviterAutocomplete, setInviterAutocomplete] = useState([])

    const [currentStep, setCurrentStep] = useState(0)
    const formSteps = [
        'Member',
        'Guest',
    ];
    const guestType = ["A", "V", "R", "E"]

    useEffect(() => {
        getAccess(currentUser && currentUser.email)
    }, [])

    async function getAccess(email) {
        try {
            const docSnap = await getDoc(doc(db, "Whitelist", email));
            if (docSnap.exists()) {
                var v = docSnap.data()
                getGroupName(v.group)
                setSelectedGroup(v.group)
                getData(v.group)
                getGuestAutocomplete(v.group)
                getInviterAutocomplete(v.group)
                getAVREReport(v.group)
            } else {
                navigate(toLogin)
                alert("Invalid Access to Attendance.js!");
            }
        } catch (error) {
            console.error(error);
            navigate(toConnectionError)
        }
    }
    async function getData(groupId) {
        const q = query(collection(db, "Member"), where("group", "==", groupId));
        const querySnapshot = await getDocs(q);

        var reportItem = {}
        var memberItem = []
        querySnapshot.forEach((doc) => {
            reportItem[doc.id] = {
                name: doc.data().name,
                isPresent: 1,
                isFellowship: 0, // Can only be 1 when isPresent is 0,
                remarks: ""
            }
            memberItem.push({
                id: doc.id,
                label: doc.data().name
            })
        });
        setMemberReport(reportItem);
        setMemberAutocomplete(memberItem);
        setLoading(false)
    }
    async function getAVREReport(currentGroupId) {
        var obj = {}
        dateIdList.forEach(async (currentDateId) => {
            const docRef = doc(db, "Attendance", currentDateId);
            const docSnap = await getDoc(docRef);

            var a = 0;
            var v = 0;
            var r = 0;
            var e = 0;
            var present = 0;
            var absent = 0;
            if (docSnap.exists() && docSnap.data()[currentGroupId] != undefined) {
                var gObj = docSnap.data()[currentGroupId].guest
                var mObj = docSnap.data()[currentGroupId].member
                for (let key in gObj) {
                    if (gObj[key].type == "A") { a++; }
                    if (gObj[key].type == "V") { v++; }
                    if (gObj[key].type == "R") { r++; }
                    if (gObj[key].type == "E") { e++; }
                }
                for (let key in mObj) {
                    if (mObj[key].isPresent == 1) {
                        present++
                    } else {
                        absent++
                    }
                }
            } else {
                console.log("Attendance/" + currentDateId + "/" + currentGroupId + " not found");
            }
            obj[currentDateId] = "A: " + a + ", V: " + v + ", R: " + r + ", E: " + e + " | Present: " + present + ", Absent: " + absent
        })
        setAvreReport(obj)
    }
    async function bindAttendanceReport(currentGroupId, currentDateId) {
        const docRef = doc(db, "Attendance", currentDateId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data()[currentGroupId] != undefined) {
            setGuestReport(docSnap.data()[currentGroupId].guest)
            setMemberReport(docSnap.data()[currentGroupId].member)
        } else {
            console.log("Attendance/" + currentDateId + "/" + currentGroupId + " not found");
        }
        setLoading(false)
    }
    async function getInviterAutocomplete(groupId) {
        const q = query(collection(db, "Member"), where("group", "!=", groupId));
        const querySnapshot = await getDocs(q);

        var memberItem = []
        querySnapshot.forEach((doc) => {
            memberItem.push({
                id: doc.id,
                label: doc.data().name
            })
        });
        setInviterAutocomplete(memberItem);
    }
    async function getGuestAutocomplete(groupId) {
        const q = query(collection(db, "Guest"), where("group", "==", groupId));
        const querySnapshot = await getDocs(q);

        var item = []
        querySnapshot.forEach((doc) => {
            item.push({
                id: doc.id,
                label: doc.data().name
            })
        });
        setGuestAutocomplete(item);
    }
    async function getGroupName(groupId) {
        const querySnapshot = await getDoc(doc(db, "Group", groupId));
        setSelectedGroupName(querySnapshot.data().name)
    }
    const handleChangeRemarks = (e, id) => {
        const { name, value } = e.target
        var updatedMemberReport = {
            ...memberReport,
            [id]: {
                ...memberReport[id],
                "remarks": value
            },
        };
        setMemberReport(updatedMemberReport);
    }
    const updateMemberReport = (id, type) => {
        var updatedMemberReport = {}
        // Present
        if (type == 1) {
            updatedMemberReport = {
                ...memberReport,
                [id]: {
                    ...memberReport[id],
                    isPresent: 1,
                    isFellowship: 0, // isFellowship can only be 1 when isPresent is 0
                    remarks: "",
                },
            };
        }
        // Fellowship 
        else if (type == 2) {
            updatedMemberReport = {
                ...memberReport,
                [id]: {
                    ...memberReport[id],
                    isPresent: 0,
                    isFellowship: 1, // isFellowship can only be 1 when isPresent is 0
                },
            };
        }
        // Absent
        else {
            updatedMemberReport = {
                ...memberReport,
                [id]: {
                    ...memberReport[id],
                    isPresent: 0,
                    isFellowship: 0,
                },
            };
        }
        setMemberReport(updatedMemberReport);
    }
    const addGuestReport = () => {
        const newObject = {
            type: "A",
            guestId: "",
            guestName: "",
            inviterId: "",
            inviterName: "",
            inviterGroup: ""
        };
        const updatedList = [...guestReport, newObject];
        setGuestReport(updatedList);
    }
    const removeGuestReport = (index) => {
        setGuestReport((guestReport) => {
            const newList = [...guestReport];
            newList.splice(index, 1); // Remove item at index 2
            return newList;
        });
    }
    const updateGuestReport = (index, type) => {
        const updatedList = [
            ...guestReport.slice(0, index),
            {
                ...guestReport[index],
                "type": type
            },
            ...guestReport.slice(index + 1),
        ];
        setGuestReport(updatedList)
    }
    const setGuest = (event, newValue, index) => {
        console.log(newValue.label)
        const updatedList = [
            ...guestReport.slice(0, index),
            {
                ...guestReport[index],
                "guestId": newValue.id,
                "guestName": newValue.label
            },
            ...guestReport.slice(index + 1),
        ];
        setGuestReport(updatedList)
    }
    const setInviter = (event, newValue, index) => {
        const updatedList = [
            ...guestReport.slice(0, index),
            {
                ...guestReport[index],
                "inviter": newValue.id,
                "inviterName": newValue.label
            },
            ...guestReport.slice(index + 1),
        ];
        setGuestReport(updatedList)
    }

    const handleChangeInput = (e, index) => {
        const { name, value } = e.target
        const updatedList = [
            ...guestReport.slice(0, index),
            {
                ...guestReport[index],
                [name]: value
            },
            ...guestReport.slice(index + 1),
        ];
        setGuestReport(updatedList)
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true)
        await setDoc(
            doc(db, "Attendance", dateId), {
            [selectedGroup]: {
                name: selectedGroupName,
                updatedDate: moment().format('MMMM Do YYYY, h:mm:ss a'),
                updatedBy: currentUser.email,
                member: memberReport,
                guest: guestReport
            }
        })
        setLoading(false)
    }
    function getThisDateId() {
        const today = moment();
        // 0 Sun - 6 Saturday 
        const dayOfWeek = today.day();
        // Application Week
        // 05 Wed, 06 Thu, 07 Fri, 08 Sat, 09 Sunday, 10 Mon, 11 Tue (08 April)
        // 12 Wed, 13 Thu, 14 Fri, 15 Sat, 16 Sunday, 17 Mon, 18 Tue (15 April)
        
        const daysUntilSaturday = 6 - dayOfWeek;
        var saturday = today.add(daysUntilSaturday, 'days');
        
        if (dayOfWeek < 3){
            saturday = saturday.add(-7, 'days');
        }

        return saturday.format(dateIdFormat);
    }
    function getThisDateIdList() {
        const saturday = moment(getThisDateId(), dateIdFormat)
        const list = []
        for (var i = 0; i < 6; i++) {
            list.push(saturday.format(dateIdFormat));
            saturday.add(-7, "days")
        }
        return list
    }
    const gotoAttendenceDetail = (dateId) => {
        setLoading(true)
        setDateId(dateId)
        bindAttendanceReport(selectedGroup, dateId)
    }
    const gotoPrevious = () => {
        navigate(toMember)
    }
    return (
        <div className='container'>
            {
                loading ?
                    <LinearProgress color="inherit" />
                    :
                    <Row>
                        {isMobile == false || (isMobile && dateId != "")
                            ?
                            <Col md={4} xs={12}>
                                <Breadcrumb>
                                    <Breadcrumb.Item onClick={() => gotoPrevious()}>Main</Breadcrumb.Item>
                                    <Breadcrumb.Item onClick={() => setDateId("")}>Attendance</Breadcrumb.Item>
                                    <Breadcrumb.Item active>{dateId}</Breadcrumb.Item>
                                </Breadcrumb>
                                <Card className='p-3'>
                                    <Form onSubmit={handleSubmit}>
                                        {
                                            dateId == thisDateId ?
                                                <>
                                                    <List>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Stepper activeStep={currentStep}>
                                                                {formSteps.map((label) => (
                                                                    <Step key={label}>
                                                                        <StepLabel>{label}</StepLabel>
                                                                    </Step>
                                                                ))}
                                                            </Stepper>
                                                        </Box>
                                                        <hr className='mt-3 mb-0'></hr>
                                                        {
                                                            currentStep == 0 ?
                                                                Object.keys(memberReport).map((key, index) => {
                                                                    return <React.Fragment key={"list-item-" + index}>
                                                                        <ListItem>
                                                                            <Box sx={{ flexDirection: 'column' }}>
                                                                                <ListItemText
                                                                                    primary={
                                                                                        memberReport[key].name
                                                                                    }>
                                                                                </ListItemText>

                                                                                <ButtonGroup>
                                                                                    <Button size='sm'
                                                                                        variant={memberReport[key].isPresent ? "success" : "outline-success"}
                                                                                        onClick={() => updateMemberReport(key, 1)}
                                                                                    >
                                                                                        Present
                                                                                    </Button>
                                                                                    <Button size='sm'
                                                                                        variant={memberReport[key].isFellowship ? "primary" : "outline-primary"}
                                                                                        onClick={() => updateMemberReport(key, 2)}
                                                                                    >
                                                                                        Fellowship
                                                                                    </Button>
                                                                                    <Button size='sm'
                                                                                        variant={memberReport[key].isPresent == 0 && memberReport[key].isFellowship == 0 ? "danger" : "outline-danger"}
                                                                                        onClick={() => updateMemberReport(key, 3)}
                                                                                    >
                                                                                        Absent
                                                                                    </Button>
                                                                                </ButtonGroup>
                                                                                {
                                                                                    memberReport[key].isPresent ?
                                                                                        <></>
                                                                                        :
                                                                                        <FormGroup className='mt-3'>
                                                                                            <TextField
                                                                                                required
                                                                                                name={"remarks-" + key}
                                                                                                value={memberReport[key].remarks}
                                                                                                onChange={(e) => handleChangeRemarks(e, key)}
                                                                                                label="Absent Remarks"
                                                                                                size="small"
                                                                                                className='w-100'
                                                                                            />
                                                                                        </FormGroup>
                                                                                }
                                                                            </Box>
                                                                        </ListItem>
                                                                        <Divider />
                                                                    </React.Fragment>
                                                                })
                                                                :
                                                                <>
                                                                    <Button variant="secondary" size="sm" type="button" className='mb-3'
                                                                        onClick={() => {
                                                                            addGuestReport();
                                                                        }}>
                                                                        <Add />
                                                                    </Button>
                                                                    {
                                                                        guestReport.map((guest, index) => {
                                                                            return <Paper key={"guest-" + index} elevation={3} className="p-2 mb-4">
                                                                                <Box
                                                                                    sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between'
                                                                                    }}
                                                                                >
                                                                                    <ButtonGroup className='mb-3'>
                                                                                        {
                                                                                            guestType.map((t) => {
                                                                                                return <Button key={"button-" + t} size='sm'
                                                                                                    variant={t == guest.type ? "primary" : "outline-primary"}
                                                                                                    onClick={() => updateGuestReport(index, t)}
                                                                                                >
                                                                                                    {t}
                                                                                                </Button>
                                                                                            })
                                                                                        }
                                                                                    </ButtonGroup>
                                                                                    <Button size="sm" variant="secondary" type="button" className='mb-3'
                                                                                        onClick={() => {
                                                                                            removeGuestReport(index);
                                                                                        }}>
                                                                                        <Remove />
                                                                                    </Button>
                                                                                </Box>
                                                                                {
                                                                                    guest.type == "A" || guest.type == "V" ?
                                                                                        <React.Fragment>
                                                                                            <FormGroup className='mb-3'>
                                                                                                <TextField
                                                                                                    required
                                                                                                    name="guestName"
                                                                                                    autoComplete='off'
                                                                                                    value={guest.guestName}
                                                                                                    onChange={(e) => handleChangeInput(e, index)}
                                                                                                    label={"Name of Guest " + (index + 1)}
                                                                                                    size="small"
                                                                                                    className='w-100'
                                                                                                />
                                                                                            </FormGroup>
                                                                                            <Autocomplete
                                                                                                disablePortal
                                                                                                name="Inviter"
                                                                                                options={guest.type == "A" ? memberAutocomplete : inviterAutocomplete}
                                                                                                onChange={(event, newValue, i) => setInviter(event, newValue, index)}
                                                                                                className="w-100"
                                                                                                renderInput={(params) => <TextField {...params} label="Set Inviter" />}
                                                                                                defaultValue={{
                                                                                                    id: guest.inviterId || "",
                                                                                                    label: guest.inviterName || ""
                                                                                                }}
                                                                                            />
                                                                                        </React.Fragment>
                                                                                        :
                                                                                        <React.Fragment>
                                                                                            <FormGroup className='mb-3'>
                                                                                                <TextField
                                                                                                    required
                                                                                                    name="guestId"
                                                                                                    value={guest.guestId}
                                                                                                    label={"Id of Guest " + (index + 1)}
                                                                                                    size="small"
                                                                                                    className='w-100'
                                                                                                />
                                                                                            </FormGroup>
                                                                                            <Autocomplete
                                                                                                disablePortal
                                                                                                name="Guest"
                                                                                                options={guestAutocomplete}
                                                                                                onChange={(event, newValue, i) => setGuest(event, newValue, index)}
                                                                                                className="w-100"
                                                                                                renderInput={(params) => <TextField {...params} label="Guest" />}
                                                                                            />
                                                                                        </React.Fragment>
                                                                                }
                                                                            </Paper>
                                                                        })
                                                                    }
                                                                </>
                                                        }
                                                    </List>

                                                    {
                                                        currentStep == 0 ?
                                                            <Button variant="secondary" type="button" className='w-100 mt-2'
                                                                onClick={() => setCurrentStep(1)}>
                                                                Next
                                                            </Button>
                                                            :
                                                            <div>
                                                                <div className='w-50 pr-3'>

                                                                </div>
                                                                <Button variant="secondary" type="button" className='w-50'
                                                                    onClick={() => setCurrentStep(0)}>
                                                                    Previous
                                                                </Button>
                                                                <Button variant="primary" type="submit" className='w-50'>
                                                                    Submit
                                                                </Button>
                                                            </div>
                                                    }
                                                </>
                                                :
                                                <></>
                                        }
                                    </Form>
                                </Card>
                            </Col>
                            :
                            <></>
                        }
                        <Col md={8} xs={12}>
                            {
                                isMobile ?
                                    dateId == "" ? <>
                                        <Breadcrumb>
                                            <Breadcrumb.Item onClick={() => gotoPrevious()}>Main</Breadcrumb.Item>
                                            <Breadcrumb.Item active>Attendance</Breadcrumb.Item>
                                        </Breadcrumb>
                                        <List dense={false}>
                                            {
                                                dateIdList.map((dateId, index) => {
                                                    return (<div key={"listItem-" + index}>
                                                        <ListItem onClick={() => gotoAttendenceDetail(dateId)}>
                                                            <ListItemText
                                                                primary={<strong>{dateId}</strong>}
                                                                secondary={avreReport[dateId]}>
                                                            </ListItemText>
                                                        </ListItem>
                                                        <Divider />
                                                    </div>
                                                    )
                                                })
                                            }
                                        </List>
                                    </>
                                        :
                                        <></>
                                    :
                                    <>Web View</>
                            }
                        </Col>
                    </Row>
            }
        </div >
    )
}
