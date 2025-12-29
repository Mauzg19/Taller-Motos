import React, { useState, useEffect } from 'react';

const AuthorizationManagement = ({ user }) => {
    const [authorizations, setAuthorizations] = useState([]);
    const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

    useEffect(() => {
        fetchAuthorizations();
    }, []);

    const fetchAuthorizations = async () => {
        try {
            const response = await fetch(`${API_ORIGIN}/api/authorizations`, {
                headers: { 'Authorization': localStorage.getItem('authHeader') }
            });
            if (response.ok) {
                const data = await response.json();
                setAuthorizations(data);
            }
        } catch (error) {
            console.error('Error fetching authorizations:', error);
        }
    };

    const handleAccept = async (id) => {
        try {
            const response = await fetch(`${API_ORIGIN}/api/authorizations/${id}/accept`, {
                method: 'POST',
                headers: { 'Authorization': localStorage.getItem('authHeader') }
            });
            if (response.ok) {
                fetchAuthorizations();
            }
        } catch (error) {
            console.error('Error accepting authorization:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await fetch(`${API_ORIGIN}/api/authorizations/${id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': localStorage.getItem('authHeader') }
            });
            if (response.ok) {
                fetchAuthorizations();
            }
        } catch (error) {
            console.error('Error rejecting authorization:', error);
        }
    };

    return (
        <div>
            <h2>Pending Authorizations</h2>
            <ul>
                {authorizations.map(auth => (
                    <li key={auth.id}>
                        {auth.message}
                        <button onClick={() => handleAccept(auth.id)}>Accept</button>
                        <button onClick={() => handleReject(auth.id)}>Reject</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AuthorizationManagement;
