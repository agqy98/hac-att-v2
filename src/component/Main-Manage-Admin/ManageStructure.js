import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.js'
import { Breadcrumb, Row, Col, Card, Form, Button, Table } from 'react-bootstrap'
import { TextField, InputLabel, MenuItem, FormControl, Select, FormGroup, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { List, ListItem, ListItemText, FormControlLabel, RadioGroup, Radio, Badge, Divider } from '@mui/material';
import { db } from '../../firebase';
import { doc, collection, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, where } from "firebase/firestore";
import { Delete as TrashIcon, Person2, Refresh } from '@mui/icons-material';


export default function ManageStructure() {
  const toLogin = "/"
  const toConnectionError = "/errorInternet"
  const navigate = useNavigate();
  const { currentUser } = useAuth()
  const isMobile = window.innerWidth < 768;
  const [loading, setLoading] = useState(true)

  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(1)
  const [item, setItem] = useState({
    name: "",
    zone: "",
    leaders: [],
    members: []
  })
  const [itemList, setItemList] = useState([])
  const [selectedZone, setSelectedZone] = useState([]);

  // const { zoneList, zoneBgColors } = useSystemContext()
  const zoneList = sessionStorage.getItem("zoneList").split(",")
  const zoneBgColors = JSON.parse(sessionStorage.getItem("zoneBgColors"))

  useEffect(() => {
    getAccess(currentUser && currentUser.email)
  }, [])
  async function getAccess(email) {
    try {
      const docSnap = await getDoc(doc(db, "Whitelist", email));
      if (docSnap.exists() && docSnap.data().admin) {
          getData();
      } else {
        navigate(toLogin)
        alert("Invalid Access to ManageStructure.js!");
      }
    } catch (error) {
      console.error(error);
      navigate(toConnectionError)
    }
  }
  async function getData() {
    try {
      const q = query(collection(db, "Group"), orderBy("zone"), orderBy("name"));
      const querySnapshot = await getDocs(q);

      var list = []
      const numberOfDocuments = querySnapshot.size;

      querySnapshot.forEach(async (doc) => {
        var obj = {
          id: doc.id,
          name: doc.data().name,
          zone: doc.data().zone,
          leaders: [],
          members: []
        }
        // Get Leaders
        var ll = []
        const q2 = query(collection(db, "Whitelist"), where("group", '==', doc.id));
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach((doc2) => {
          ll.push(doc2.data().name)
        });
        if (ll.length > 0) {
          obj.leaders = ll;
        }
        // Get Members
        const q3 = query(collection(db, "Member"), where("group", '==', doc.id));
        var ml = []
        const querySnapshot3 = await getDocs(q3);
        querySnapshot3.forEach((doc3) => {
          ml.push(doc3.data().name)
        });
        if (ml.length > 0) {
          obj.members = ml;
        }
        list.push(obj);
      });
      setItemList(list)
      if (isMobile && page == 2) setPage(1)
      setTimeout(() => {
        setReset();
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error(error);
      alert("Failed to get document because the client is offline. Please check your internet connection and try again.");
    }
  }
  const setEdit = (obj) => {
    setIsEdit(true)
    if (isMobile) {
      setPage(2)
    }
    setItem({
      id: obj.id,
      name: obj.name,
      zone: obj.zone
    })
  }
  function setReset(event) {
    setIsEdit(false)
    setItem({
      id: "",
      name: "",
      zone: ""
    })
  }
  const handleZoneSelectionChange = (event) => {
    setSelectedZone(event.target.value)
  };
  const handleChangeInput = (e) => {
    const { name, value } = e.target
    setItem({ ...item, [name]: value })
  }
  async function handleSubmit(event) {
    event.preventDefault();

    var data = {
      name: item.name,
      zone: item.zone
    }
    setLoading(true)
    if (isEdit) {
      await updateDoc(
        doc(db, "Group", item.id), data);
    } else {
      await setDoc(
        doc(db, "Group", item.id), data)
    }
    setReset();
    getData();
    setLoading(false)
  }
  async function handleDelete(obj) {
    if (window.confirm("Confirm to delete group " + obj.name + "?")) {
      setLoading(true)
      // Edit Group = NULL in Planted Member (Table [Planted Member] is using Group as Foreign Key)
      // Delete Group
      setReset();
      getData();
      setLoading(false)
    }
  }
  return (
    <div className='container'>
      <Breadcrumb>
        <Breadcrumb.Item active>Admin</Breadcrumb.Item>
        <Breadcrumb.Item active>Manage Group</Breadcrumb.Item>
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
                        hidden={isEdit ? false : true}
                        required
                        name="id"
                        value={item.id}
                        disabled
                        label="ID"
                        size="small"
                        className='m-2'
                      />
                    </FormGroup>
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
                      <FormControl size="small" sx={{ m: 1 }}>
                        <InputLabel id="select-zone">Zone</InputLabel>
                        <Select
                          required
                          labelId="select-zone"
                          name="zone"
                          value={item.zone}
                          label="Zone"
                          onChange={handleChangeInput}
                        >
                          {
                            zoneList && zoneList.map((name, index) => {
                              return <MenuItem key={"zone-" + index} value={name}>{name}</MenuItem>
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
                    {/* <Button variant="secondary" type="button"
                      className='ml-2'
                      onClick={() => {
                        setReset();
                      }}>
                      <Refresh fontSize='small' />
                    </Button> */}
                    <RadioGroup
                      row
                      aria-labelledby="row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      value={selectedZone}
                      onChange={handleZoneSelectionChange}
                    >
                      {
                        zoneList.map(zone => {
                          return <FormControlLabel key={"radio-" + zone} value={zone} control={<Radio />} label={zone.substring(0, 1)} />
                        })
                      }
                    </RadioGroup>
                    <List
                      className="mt-3"
                      dense={false}>
                      {
                        itemList && itemList.map((obj, index) => {
                          return obj.zone == selectedZone ?
                            <>
                              <Divider className='my-1' />
                              <ListItem key={"list-item-" + index}
                                style={{ backgroundColor: zoneBgColors[obj.zone] }}
                                secondaryAction={
                                  <ListItemText>
                                    <Button variant="danger" size='sm' type="button" onClick={() => handleDelete(obj)}>
                                      <TrashIcon fontSize='small' />
                                    </Button>
                                  </ListItemText>
                                }
                              >
                                <ListItemText
                                  primary={
                                    <Typography variant="body1" color="text.secondary">
                                      {obj.name + " (" + (obj.members && obj.members.length) + ")"}
                                      {
                                        obj.leaders && obj.leaders.length > 0 ?
                                          <Badge badgeContent={obj.leaders && obj.leaders.length} color="primary">
                                            <Person2 color="action" />
                                          </Badge>
                                          :
                                          <></>
                                      }
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" color="text.secondary">
                                      {
                                        obj.members && obj.members.map((m, index) => {
                                          return (
                                            <>
                                              <br />
                                              {(index + 1) + ". " + m}
                                            </>
                                          )
                                        })
                                      }
                                    </Typography>
                                  }
                                  onClick={() => setEdit(obj)}>
                                </ListItemText>
                              </ListItem>
                            </>
                            :
                            <></>
                        })
                      }
                    </List>
                  </>
                    :
                    <></>
                  :
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Zone</th>
                        <th>Leaders</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        itemList && itemList.map((obj, index) => {
                          return <tr key={"row" + index} style={{ backgroundColor: zoneBgColors[obj.zone] }} onClick={() => setEdit(obj)}>
                            <td>{obj.name}</td>
                            <td>{obj.zone}</td>
                            <td>{obj.leaders && obj.leaders.toString()}</td>
                            <td>
                              <Button variant="danger" size='sm' type="button" onClick={() => handleDelete(obj)}>
                                <TrashIcon fontSize='small' />
                              </Button>
                            </td>
                          </tr>
                        })
                      }
                    </tbody>
                  </Table>
              }
            </Col>
          </Row>
      }
    </div >
  )
}
