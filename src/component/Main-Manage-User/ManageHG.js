import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.js'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase.js';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, setDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { TextField, InputLabel, MenuItem, FormControl, Select, FormGroup, Box, Divider, List, ListItem, ListItemText, Typography, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { Breadcrumb, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { DataGrid } from '@mui/x-data-grid';
import { Refresh, Delete as TrashIcon } from '@mui/icons-material';
import moment from 'moment';
import LinearProgress from '@mui/material/LinearProgress';

export default function ManageHG() {
  const toLogin = "/"
  const toMember = '/member'
  const toConnectionError = "/errorInternet"

  const navigate = useNavigate();
  const { currentUser } = useAuth()
  const isMobile = window.innerWidth < 768;
  const [loading, setLoading] = useState(true)

  const [selectedGroup, setSelectedGroup] = useState("")
  const [item, setItem] = useState({
    id: "",
    name: "",
    gender: "",
    dobFull: "",
    dob: "",
    age: "",
    baptism: "",
    phase: "Primary",
    role: "",
  })
  const [members, setMembers] = useState([])

  // const { zoneList, roleList, zoneBgColors } = useSystemContext()

  const phaseList = sessionStorage.getItem("phaseList").split(",")

  const [page, setPage] = useState(1)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    getAccess(currentUser.email);
  }, []);

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
      field: 'role',
      headerName: 'Role',
      width: 90,
    },
  ];
  async function getAccess(email) {
    try {
      const docSnap = await getDoc(doc(db, "Whitelist", email));
      if (docSnap.exists()) {
        var v = docSnap.data()
        setSelectedGroup(v.group)
        getData(v.group)
      } else {
        navigate(toLogin)
        console.log("Invalid Access to ManageHG.js!");
      }
    } catch (error) {
      console.error(error);
      navigate(toConnectionError)
    }
  }
  async function getData(groupId) {
    //, orderBy("zone"), orderBy("role", "desc"), orderBy("name")
    const q = query(collection(db, "Member"), where("group", "==", groupId));
    const querySnapshot = await getDocs(q);

    var items = []
    querySnapshot.forEach((doc) => {
      var v = doc.data();

      var objItem = {
        id: doc.id,
        name: v.name,
        gender: v.gender == 1 ? "Male" : "Female",
        dobFull: v.dob,
        dob: v.dob && moment(v.dob, "YYYY-MM-DD").format("MM-DD"),
        age: v.dob && moment().year() - moment(v.dob, "YYYY-MM-DD").year(),
        baptism: v.baptism,
        phase: v.phase,
        role: v.role == 1 ? "Member" : "Leader",
      }
      items.push(objItem)
    });
    setMembers(items);
    setLoading(false)
  }
  const setEdit = (obj) => {
    setIsEdit(true)
    if (isMobile) {
      setPage(2)
    }
    setItem(obj.row || obj)
  }
  function setReset(event) {
    setIsEdit(false)
    setItem({
      id: "",
      name: "",
      gender: "",
      dobFull: "",
      dob: "",
      age: "",
      baptism: "",
      phase: "Primary",
      role: "",
    })
  }
  const handleChangeInput = (e) => {
    const { name, value } = e.target
    console.log(name + ": " + value)
    setItem({ ...item, [name]: value })
  }
  async function handleSubmit(event) {
    event.preventDefault();
    var data = {
      name: item.name,
      gender: item.gender,
      dob: item.dobFull,
      baptism: item.baptism,
      phase: item.phase,
      role: item.role,
    }
    setLoading(true)
    if (isEdit) {
      await updateDoc(
        doc(db, "Member", item.id), data);
    } else {
      // Handle Gender
      if (data.gender == "Male") {
        data.gender = 1;
      } else if (data.gender == "Female") {
        data.gender = 2;
      } else {
        alert("Please select a gender")
      }
      // Handle Role
      if (data.role == "Member") {
        data.role = 1;
      } else if (data.role == "Leader") {
        data.role = 2;
      } else {
        alert("Please select a role")
      }
      await addDoc(
        doc(db, "Member"), data)
    }
    setReset();
    getData(selectedGroup);
    setLoading(false)
  }
  async function handleDelete(obj) {
    if (window.confirm("Confirm to exit member " + obj.name + "?")) {
      setLoading(true)
      await addDoc(doc(db, "Member"), obj)
      await deleteDoc(doc(db, "Member", obj.id));
      setReset();
      getData(selectedGroup);
      setLoading(false)
    }
  }
  const gotoPrevious = () => {
    navigate(toMember)
  }
  return (
    <div className='container'>
      <Breadcrumb>
        <Breadcrumb.Item onClick={() => gotoPrevious()}>Main</Breadcrumb.Item>
        <Breadcrumb.Item active>Manage HG</Breadcrumb.Item>
      </Breadcrumb>
      {
        loading ?
          <LinearProgress color="inherit" />
          :
          <Row>
            {isMobile == false || (isMobile && page == 2)
              ?
              <Col md={4} xs={12}>
                <Card className='p-3'>
                  <Form onSubmit={handleSubmit} onReset={setReset}>
                    <FormGroup>
                      <TextField
                        required
                        name="name"
                        value={item.name}
                        onChange={handleChangeInput}
                        label="Name"
                        size="small"
                        className='m-2'
                      />
                    </FormGroup>
                    <FormGroup>
                      <RadioGroup
                        row
                        required
                        aria-labelledby="row-radio-buttons-group-label"
                        name="gender"
                        value={item.gender}
                        className='mx-2'
                        onChange={handleChangeInput}
                      >
                        <FormControlLabel value="Male" control={<Radio />} label="Male" />
                        <FormControlLabel value="Female" control={<Radio />} label="Female" />
                      </RadioGroup>
                    </FormGroup>
                    <FormGroup>
                      <RadioGroup
                        row
                        required
                        aria-labelledby="row-radio-buttons-group-label"
                        name="role"
                        value={item.role}
                        className='mx-2'
                        onChange={handleChangeInput}
                      >
                        <FormControlLabel value="Member" control={<Radio />} label="Member" />
                        <FormControlLabel value="Leader" control={<Radio />} label="Leader" />
                      </RadioGroup>
                    </FormGroup>
                    <FormGroup className='m-2'>
                      <Form.Label>Birthday</Form.Label>
                      <TextField
                        required
                        name="dobFull"
                        value={item.dobFull}
                        onChange={handleChangeInput}
                        type="date"
                        size="small"
                      />
                    </FormGroup>
                    <FormGroup className='m-2'>
                      <Form.Label>Baptism</Form.Label>
                      <TextField
                        name="baptism"
                        value={item.baptism}
                        onChange={handleChangeInput}
                        type="text"
                        size="small"
                        placeholder='YYYY-MM'
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormControl size="small" sx={{ m: 1 }}>
                        <InputLabel id="select-phase">Phase</InputLabel>
                        <Select
                          required
                          labelId="select-phase"
                          name="phase"
                          value={item.phase}
                          label="Phase"
                          onChange={handleChangeInput}
                        >
                          {
                            phaseList && phaseList.map((name, index) => {
                              return <MenuItem key={"role-" + index} value={name}>{name}</MenuItem>
                            })
                          }
                        </Select>
                      </FormControl>
                    </FormGroup>
                    <Button variant="primary" type="submit" className='m-2'>
                      Save
                    </Button>
                    <Button variant="secondary" type="reset" className='m-2'>
                      Clear
                    </Button>
                    {isMobile ?
                      <Button variant="secondary" type="button" className='m-2'
                        onClick={() => {
                          setReset();
                          setPage(1);
                        }}>
                        Back
                      </Button>
                      :
                      <></>
                    }
                    {isEdit ?
                      <Button variant="danger" className='m-2' type="button" onClick={() => handleDelete(item.email)}>
                        <TrashIcon />
                      </Button>
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
                  page == 1 ? <>
                    <Button variant="secondary" type="button"
                      onClick={() => {
                        setPage(2);
                      }}>
                      Add
                    </Button>
                    <Button variant="secondary" type="button"
                      className='ml-2'
                      onClick={() => {
                        setReset();
                      }}>
                      <Refresh fontSize='small' />
                    </Button>
                    <List className="mt-1"
                      dense={false}>
                      {
                        members.map((m, index) => {
                          return <div key={"list-item-" + index}>
                            <ListItem
                              onClick={() => setEdit(m)}
                            >
                              <ListItemText
                                primary={m.name}
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {m.dob}, {m.age}
                                    <br />
                                    {m.phase}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </div>
                        })
                      }
                    </List>
                  </>
                    :
                    <></>
                  :
                  <>
                    <Box sx={{ height: '400px', width: '100%' }}>
                      <DataGrid
                        rows={members}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        onRowClick={setEdit}
                      />
                    </Box>
                  </>
              }
            </Col>
          </Row>
      }
    </div >
  )
}
