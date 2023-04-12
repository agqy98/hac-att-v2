import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert, Row } from "react-bootstrap"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

export default function ForgotPassword() {

    // Fields
    const emailRef = useRef()

    // Reset Password Function
    const { resetPassword } = useAuth()

    // Common
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setError("")
            setMessage("")
            setLoading(true)
            await resetPassword(emailRef.current.value)
            setMessage("Check your inbox for further instructions")
        } catch (err) {
            setError("Failed to reset password " + err)
        }
        setLoading(false)
    }
    return (
        <>
            <Row className='d-flex align-items-center justify-content-center mt-5'>
                <Card style={{ width: "350px" }}>
                    <Card.Body>
                        <Link to="/">
                            <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>
                        </Link>
                        <h2 className="text-center mb-4">Password Reset</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {message && <Alert variant="success">{message}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email" className="pb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" ref={emailRef} required />
                            </Form.Group>
                            <Button disabled={loading} className="w-100" type="submit">
                                Reset Password
                            </Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            Need an account? <Link to="/signup">Sign Up</Link>
                        </div>
                    </Card.Body>
                </Card>
            </Row>
        </>
    )
}