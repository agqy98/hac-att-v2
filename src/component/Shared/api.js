import { db } from "../../firebase";
import { doc, getDoc } from "@firebase/firestore";

export async function getZoneList() {
    const docRef = doc(db, "System_Type", "Zone");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        sessionStorage.setItem("zoneList", docSnap.data().Value)
        getBgColors(docSnap.data().Value)
    } else {
        console.log("Zone List not found!");
    }
}
export async function getPhaseList() {
    const docRef = doc(db, "System_Type", "LifePhase");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        sessionStorage.setItem("phaseList", docSnap.data().Value)
        getBgColors(docSnap.data().Value)
    } else {
        console.log("Phase List not found!");
    }
}
export async function getRoleList() {
    const docRef = doc(db, "System_Type", "Role");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        sessionStorage.setItem("roleList", docSnap.data().Value)
    } else {
        console.log("Role List not found!");
    }
}

export async function getBgColors(zones) {
    const docRef = doc(db, "System_Type", "ZoneBgColor");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        var obj = {}
        zones.forEach((zone, index) => {
            obj[zone] = docSnap.data().Value[index]
        })
        sessionStorage.setItem("zoneBgColors", JSON.stringify(obj))
    } else {
        console.log("Zone Color List not found!");
    }
}
