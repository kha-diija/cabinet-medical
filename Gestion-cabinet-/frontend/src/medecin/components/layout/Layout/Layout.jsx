import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-layout" style={{
            backgroundColor: 'var(--background-primary)',
            color: 'var(--text-primary)'
        }}>
            <Navbar />
            <Sidebar />
            
            <main className="main-content" style={{
                marginLeft: '260px',
                paddingTop: '70px',
                minHeight: 'calc(100vh - 70px)',
                backgroundColor: 'var(--background-primary)'
            }}>
                <div className="content-wrapper" style={{
                    padding: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;