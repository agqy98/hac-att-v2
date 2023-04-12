import React, { useEffect, useRef, useState } from 'react'
import { Form, Button, Card, Alert, Row, Spinner } from 'react-bootstrap'
import LinearProgress from '@mui/material/LinearProgress';
import { useAuth } from '../../context/AuthContext.js'
import { Link, useNavigate } from 'react-router-dom'

// Database
import { db } from '../../firebase.js'
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
    // Edit the following parameter to change the location to redirect after login 
    const toNav = "/Member"

    // Fields
    const emailRef = useRef()
    const passwordRef = useRef()

    // Sign in function
    const { signin, currentUser } = useAuth()

    // Common
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Others
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            getAccess(currentUser.email)
        }
    }, [currentUser]);

    async function getAccess(email) {
        setLoading(true)
        const docSnap = await getDoc(doc(db, "Whitelist", email));
        if (docSnap.exists()) {
            navigate(toNav)
        } else {
            setLoading(false)
            console.log("Invalid Access!");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Try catch because it's a async function
        try {
            setError('')
            setLoading(true)
            await signin(emailRef.current.value, passwordRef.current.value)
        } catch (err) {
            alert(err)
        }
    }

    return (
        currentUser ?
            loading ?
                <LinearProgress color="inherit" />
                :
                <div className='text-center m-5'>
                    <h3>
                        Access Denied:
                    </h3>
                    <p>
                        You do not have the necessary permissions to access this resource.<br />
                        Please contact the administrator or log in with a valid account.
                    </p>
                </div>
            :
            <div className='container'>
                <Row className='d-flex align-items-center justify-content-center pt-5'>
                    <Card style={{ width: "350px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4">Log In</h2>
                            {error && <Alert variant='danger'>{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" ref={emailRef} required />
                                </Form.Group>
                                <Form.Group id="password" className='mb-3'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" ref={passwordRef} autoComplete={{ suggested: "current-password" }} required />
                                </Form.Group>
                                <Button disabled={loading} type="submit" className="w-100 mt-4">
                                    Log In
                                </Button>
                            </Form>
                            <div className='text-center mt-2'>
                                <Link to="/forget-password">Forget Password</Link>
                            </div>
                            <div className='text-center mt-2'>
                                Need an account? <Link to="/signup">Sign Up</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Row>
            </div>
    )
}
