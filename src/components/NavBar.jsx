import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = () => (
  <header className="h-header md:h-header-md bg-gradient-to-r from-gray-700 to-gray-400">
    <div className="h-16 flex items-center container text-white px-4">
      <NavLink className="font-bold text-xl" to="/">
        CovInce
      </NavLink>
    </div>
  </header>
)

export default NavBar
