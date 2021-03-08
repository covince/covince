import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = () => (
  <header className="bg-gray-100 shadow-md h-20 flex items-center">
    <div className="px-6 container mx-auto text-sanger-medium-blue">
      <NavLink className="font-display font-medium text-xl" to="/">
        CovInce
      </NavLink>
    </div>
  </header>
)

export default NavBar
