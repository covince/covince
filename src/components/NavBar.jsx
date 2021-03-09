import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = () => (
  <header className="bg-gray-100 shadow-md h-16 flex items-center">
    <div className="container text-sanger-medium-blue">
      <NavLink className="font-display font-medium text-xl" to="/">
        CovInce
      </NavLink>
    </div>
  </header>
)

export default NavBar
