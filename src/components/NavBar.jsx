import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = () => (
  <header className="h-36 bg-gradient-to-r from-gray-700 to-gray-400">
    <div className="h-16 flex items-center container text-white">
      <NavLink className="font-bold text-xl" to="/">
        CovInce
      </NavLink>
    </div>
  </header>
)

export default NavBar
