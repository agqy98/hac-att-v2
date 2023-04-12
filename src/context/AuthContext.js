import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, createUser, signinUser, signoutUser } from '../firebase.js'
import { sendPasswordResetEmail } from 'firebase/auth'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    // common
    const [loading, setLoading] = useState(true)

    // auth
    const [currentUser, setCurrectUser] = useState()

    function signup(email, password) {
        // Return a promise
        return createUser(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("User " + user.email + " signed in")
            })
            .catch((error) => {
                alert(error.code + " : " + error.message)
            });
    }
    function signin(email, password) {
        // Return a promise
        return signinUser(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("User " + user.email + " signed in")
            })
            .catch((error) => {
                alert(error.code + " : " + error.message)
            });
    }
    function signout() {
        return signoutUser(auth).then(() => {
            // Signed out
            window.location.href = '/';

        }).catch((error) => {
            alert(error.code + " : " + error.message)
        });
    }
    function resetPassword(email) {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Reset email sent to '" + email + "', check Junk if not found.")
            })
            .catch((error) => {
                alert(error.code + " : " + error.message)
            });
    }
    function updatePassword(password) {
        return currentUser.updatePassword(password)
    }

    // Only run once on mount
    useEffect(() => {
        // make sure we unsubscribe whenever we are done
        const unsubscribe = auth.onAuthStateChanged(user => {
            setLoading(false)
            setCurrectUser(user)
        })
        return unsubscribe
    }, [])

    const value = {
        currentUser,
        signup,
        signin,
        signout,
        resetPassword,
        updatePassword
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}