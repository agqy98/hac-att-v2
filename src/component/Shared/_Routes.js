import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from '../loginCredential/Login'
import SignUp from '../loginCredential/SignUp';
import ResetPw from '../loginCredential/ForgetPassword';

import Member from '../Main-Dashboard/Member';
import Guest from '../Main-Dashboard/Guest';

import ManageHG from '../Main-Manage-User/ManageHG';
import Attendance from '../Main-Manage-User/Attendance';

import ManageAccess from '../Main-Manage-Admin/ManageAccess'
import ManageStruct from '../Main-Manage-Admin/ManageStructure'
import ManageParameter from '../Main-Manage-Admin/ManageParameter'

import RequestMergeHG from '../Main-Requests/RequestMergeHG'
import RequestNewLeader from '../Main-Requests/RequestNewLeader'
import RequestTransferMember from '../Main-Requests/RequestTransferMember'
import RequestPriorityBooking from '../Main-Requests/RequestPriorityBooking'
import Offline from './offline';

export default function _Routes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<React.Fragment><Login /></React.Fragment>} />
                <Route path="/signUp" element={<React.Fragment><SignUp /></React.Fragment>} />
                <Route path="/resetPassword" element={<React.Fragment><ResetPw /></React.Fragment>} />
                <Route path="/member" element={<React.Fragment><Member /></React.Fragment>} />
                <Route path="/guest" element={<React.Fragment><Guest /></React.Fragment>} />

                <Route path="/manageHG" element={<React.Fragment><ManageHG /></React.Fragment>} />
                <Route path="/attendance" element={<React.Fragment><Attendance /></React.Fragment>} />

                <Route path="/manageAccess" element={<React.Fragment><ManageAccess /></React.Fragment>} />
                <Route path="/manageGroups" element={<React.Fragment><ManageStruct /></React.Fragment>} />
                <Route path="/manageParameter" element={<React.Fragment><ManageParameter /></React.Fragment>} />

                <Route path="/reqnewhgl" element={<React.Fragment><RequestNewLeader /></React.Fragment>} />
                <Route path="/reqmergehg" element={<React.Fragment><RequestMergeHG /></React.Fragment>} />
                <Route path="/reqtransfermember" element={<React.Fragment><RequestTransferMember /></React.Fragment>} />
                <Route path="/reqprioritybooking" element={<React.Fragment><RequestPriorityBooking /></React.Fragment>} />
                
                <Route path="/myAcc" element={<React.Fragment>
                    
                </React.Fragment>} />
                <Route path="/errorInternet" element={<React.Fragment><Offline /></React.Fragment>} />
            </Routes>
        </BrowserRouter>
    )
}
