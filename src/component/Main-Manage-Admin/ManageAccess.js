import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.js'
import { useNavigate } from 'react-router-dom'
import { Breadcrumb, Row, Col, Card, Form, Button, Table } from 'react-bootstrap'
import { TextField, InputLabel, MenuItem, FormControl, Select, FormGroup, Divider, ListItemText, Typography } from '@mui/material';
import { List, ListItem, Autocomplete } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { db } from '../../firebase';
import { doc, collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { Delete as TrashIcon, Refresh } from '@mui/icons-material';

export default function ManageAccess() {
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
    email: "",
    role: "",
    zone: ""
  })
  const [itemList, setItemList] = useState([])
  const [groupList, setGroupList] = useState([])
  const [leaderList, setLeaderList] = useState([])
  const [nonLeaderList, setNonLeaderList] = useState([])

  // const { zoneList, roleList, zoneBgColors } = useSystemContext()

  const zoneList = sessionStorage.getItem("zoneList").split(",")
  const roleList = sessionStorage.getItem("roleList").split(",")
  const zoneBgColors = JSON.parse(sessionStorage.getItem("zoneBgColors"))

  useEffect(() => {
    getAccess(currentUser && currentUser.email)
  }, [])

  async function getAccess(email) {
    try {
      const docSnap = await getDoc(doc(db, "Whitelist", email));
      if (docSnap.exists() && docSnap.data().admin) {
        getGroupList()
        getLeaderList()
        getNonLeaderList()
        getData();
      } else {
        navigate(toLogin)
        alert("Invalid Access to ManageAccess.js!");
      }
    } catch (error) {
      console.error(error);
      navigate(toConnectionError)
    }
  }
  async function getData() {
    try {
      var list = []
      const querySnapshot = await getDocs(collection(db, "Whitelist"));
      querySnapshot.forEach(async (d) => {
        var obj = {
          name: d.data().name,
          email: d.id,
          role: d.data().role,
          zone: d.data().zone,
          admin: d.data().admin,
          identity: d.data().identity,
          group: d.data().group
        }
        if (d.data().identity) {
          const docRef = doc(db, "Member", d.data().identity);
          const docSnap = await getDoc(docRef);
          obj.identity = docSnap.data().name
        }
        if (d.data().group) {
          const docRefG = doc(db, "Group", d.data().group);
          const docSnapG = await getDoc(docRefG);
          obj.group = docSnapG.data().name
        }
        list.push(obj);
      });

      setItemList(list);
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
  async function getLeaderList() {
    try {
      var list = []
      const q = query(collection(db, "Member"), where("role", "==", 2));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        var obj = {
          id: doc.id,
          label: doc.data().name
        }
        list.push(obj);
      });
      setLeaderList(list)
    } catch (error) {
      console.error(error);
      alert("Failed to get document because the client is offline. Please check your internet connection and try again.");
    }
  }
  async function getNonLeaderList() {
    try {
      var list = []
      const q = query(collection(db, "Member"), where("role", "==", 1));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        var obj = {
          id: doc.id,
          label: doc.data().name
        }
        list.push(obj);
      });
      setNonLeaderList(list)
    } catch (error) {
      console.error(error);
      alert("Failed to get document because the client is offline. Please check your internet connection and try again.");
    }
  }
  async function getGroupList() {
    try {
      var list = []
      const q = query(collection(db, "Group"), orderBy("name"));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        var obj = {
          id: doc.id,
          label: doc.data().name
        }
        list.push(obj);
      });
      setGroupList(list)
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
      email: obj.email,
      name: obj.name,
      role: obj.role,
      zone: obj.zone
    })
  }
  function setReset(event) {
    setIsEdit(false)
    setItem({
      name: "",
      email: "",
      zone: "",
      role: ""
    })
  }
  async function setAdmin(e) {
    setLoading(true)
    var value = e.target.checked;
    var email = e.target.getAttribute('data-email');

    await updateDoc(
      doc(db, "Whitelist", email), {
      admin: value
    });
    getData()
  }
  async function setIdentity(e, v) {
    setLoading(true)
    await updateDoc(
      doc(db, "Whitelist", item.email), {
      identity: v.id
    });
    getData()
  }
  async function setGroup(e, v) {
    setLoading(true)
    await updateDoc(
      doc(db, "Whitelist", item.email), {
      group: v.id
    });
    getData()
  }
  async function nullGroup(event) {
    console.log("called")
    setLoading(true)
    await updateDoc(
      doc(db, "Whitelist", item.email), {
      group: ""
    });
    getData()
  }
  const handleChangeInput = (e) => {
    const { name, value } = e.target
    setItem({ ...item, [name]: value })
  }
  async function handleSubmit(event) {
    event.preventDefault();
    var data = {
      name: item.name,
      zone: item.zone,
      role: item.role
    }
    setLoading(true)
    if (isEdit) {
      await updateDoc(
        doc(db, "Whitelist", item.email), data);
    } else {
      await setDoc(
        doc(db, "Whitelist", item.email), data)
    }
    setReset();
    getData();
    setLoading(false)
  }
  async function handleDelete(email) {
    if (window.confirm("Confirm to remove access of " + email + "?")) {
      setLoading(true)
      await deleteDoc(doc(db, "Whitelist", email));
      setReset();
      getData();
      setLoading(false)
    }
  }
  return (
    <div className='container'>
      <Breadcrumb>
        <Breadcrumb.Item active>Admin</Breadcrumb.Item>
        <Breadcrumb.Item active>Manage Access</Breadcrumb.Item>
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
                      <TextField
                        required
                        name="email"
                        value={item.email}
                        onChange={handleChangeInput}
                        disabled={isEdit}
                        label="Email"
                        type="email"
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
                    <FormGroup>
                      <FormControl size="small" sx={{ m: 1 }}>
                        <InputLabel id="select-role">Role</InputLabel>
                        <Select
                          required
                          labelId="select-role"
                          name="role"
                          value={item.role}
                          label="Role"
                          onChange={handleChangeInput}
                        >
                          {
                            roleList && roleList.map((name, index) => {
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
                      <>
                        <Divider />
                        <FormGroup>
                          <Autocomplete
                            disablePortal
                            name="identity"
                            options={item.role == "Support" ? nonLeaderList : leaderList}
                            onChange={(event, newValue) => setIdentity(event, newValue)}
                            sx={{ m: 1 }}
                            renderInput={(params) => <TextField {...params} label="Link Profile" />}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Autocomplete
                            disablePortal
                            name="group"
                            options={groupList}
                            onChange={(event, newValue) => setGroup(event, newValue)}
                            sx={{ m: 1 }}
                            renderInput={(params) => <TextField {...params} label="Link Group" />}
                          />
                          <Button variant='Link' type="button" onClick={(event) => nullGroup(event)}>Unlink</Button>
                        </FormGroup>
                        <Button variant="danger" size='sm' type="button" onClick={() => handleDelete(item.email)}>
                          <TrashIcon fontSize="small" />
                        </Button>
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
                    <List
                      className="mt-1"
                      dense={false}>
                      {
                        itemList && itemList.map((obj, index) => {
                          return <ListItem key={"list-item-" + index}
                            style={{ backgroundColor: zoneBgColors[obj.zone] }}
                            secondaryAction={
                              <Form.Check
                                type="checkbox"
                                label="Admin"
                                data-email={obj.email}
                                checked={obj.admin}
                                key={"list-item-cb" + index}
                                onChange={setAdmin}
                              />
                            }
                          >
                            <ListItemText
                              primary={obj.name}
                              secondary=
                              {
                                <Typography variant="body2" color="text.secondary">
                                  {obj.email}
                                  <br />
                                  {obj.role}
                                  <br />
                                  Profile: {obj.identity ? obj.identity : <>-</>}
                                  <br />
                                  Group: {obj.group ? obj.group : <>-</>}
                                </Typography>
                              }
                              onClick={() => setEdit(obj)}>
                            </ListItemText>
                          </ListItem>
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
                        <th>Email</th>
                        <th>Zone</th>
                        <th>Role</th>
                        <th>Identity</th>
                        <th>Group</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        itemList && itemList.map((obj, index) => {
                          return <tr key={"row" + index} style={{ backgroundColor: zoneBgColors[obj.zone] }} onClick={() => setEdit(obj)}>
                            <td>{obj.name}</td>
                            <td>{obj.email}</td>
                            <td>{obj.zone}</td>
                            <td>{obj.role}</td>
                            <td>{obj.identity}</td>
                            <td>{obj.group}</td>
                            <td>
                              <Button variant="danger" size='sm' type="button" onClick={() => handleDelete(obj.email)}>
                                <TrashIcon fontSize="small" />
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
