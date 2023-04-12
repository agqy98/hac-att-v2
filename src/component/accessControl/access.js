import React from 'react'
import { getDatabase, ref, onValue } from "firebase/database";

export default function access() {
    /*
     * 40 @
     * 2D - 
     * 2E . 
     * 5F _
     */
    // Sign in function
    const { currentUser } = useAuth()

    // Database
    const db = getDatabase();
    const whitelistedRef = ref(db, 'whitelisted');

    var result = []
    get(whitelistedRef).then((snapshot) => {
        snapshot.forEach(childSnapshot => {
            var k = childSnapshot.key
            const v = childSnapshot.val();

            if (v.name != "") {
                data.push({
                    id: k,
                    zone: v.zone,
                    group: v.group,
                    name: v.name,
                    gender: v.gender,
                    phase: v.phase,
                    ministry: v.ministry,
                    dob: v.dob,
                    baptism: v.baptism
                })
            }
        });
        try {
            data.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.log(error)
        };   
    });

    return (
        <div>
        </div>
    )
}
