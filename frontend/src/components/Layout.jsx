import React from 'react';
import logo from '../assets/logo.png';
 // assuming logo styles are in there
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <header className="app-header">
        <img src={logo} alt="Logo" className="header-logo" />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;