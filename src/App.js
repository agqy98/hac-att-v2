import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { getPhaseList, getZoneList, getRoleList } from './component/Shared/api';

// Shared
import _Layout from './component/Shared/_Layout';
import { useNavigate } from 'react-router';

const App = () => {
    useEffect(() => {
        async function fetchData() {
            try {
                await getPhaseList();
                await getZoneList();
                await getRoleList();
            } catch (error) {
                console.error(error);
                console.error(window.location.href);
                if (window.location.href.indexOf("/errorInternet") == -1) {
                    window.location.href = "/errorInternet"
                }
            }
        }
        fetchData();
        document.title = "HAC Att"
    }, [])
    return (
        <div>
            <AuthProvider>
                <_Layout />
            </AuthProvider>
        </div>
    )
};

export default App;