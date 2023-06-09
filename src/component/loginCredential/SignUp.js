import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert, Row } from 'react-bootstrap'
import { useAuth } from "../../context/AuthContext"
import { Link, useNavigate } from 'react-router-dom'

export default function SignUp() {

    // Fields
    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmRef = useRef()

    // Sign up function
    const { signup } = useAuth()

    // Common
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Others
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match')
        }
        // Try catch because it's a async function
        try {
            setError('')
            setLoading(true)
            await signup(emailRef.current.value, passwordRef.current.value)
            navigate('/')
        } catch (err) {
            console.log(err)
        }

        setLoading(false)
    }

    return (
        <div className='container'>
            <Row className='d-flex align-items-center justify-content-center pt-5'>
                <Card style={{ width: "350px" }}>
                    <Card.Body>
                        <h2 className="text-center mb-4">Sign Up</h2>
                        {error && <Alert variant='danger'>{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email" className='mb-3'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" ref={emailRef} required />
                            </Form.Group>
                            <Form.Group id="password" className='mb-3'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" ref={passwordRef} required />
                            </Form.Group>
                            <Form.Group id="password-confirm" className='mb-3'>
                                <Form.Label>Password Confirmation</Form.Label>
                                <Form.Control type="password" ref={passwordConfirmRef} required />
                            </Form.Group>
                            <Button disabled={loading} type="submit" className="w-100 mt-4">Sign Up</Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            Already have an account? <Link onClick={() => navigate('Login')}>Log In</Link>
                        </div>
                    </Card.Body>
                </Card>
            </Row>
        </div>
    )
}
