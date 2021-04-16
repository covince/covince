import React from 'react'
import { NavLink } from 'react-router-dom'

const NavBar = () => (
  <header className="h-header md:h-header-md bg-gradient-to-r from-blue-900 to-indigo-900">
    <div className="h-16 flex items-center container text-white px-4">
      <NavLink className="font-bold text-xl" to="/">
        CovInce GISAID data explorer
      </NavLink>
     <div className="w-220 ml-10"> <p>Enabled by data from <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" className="w-20"></img></p>
      </div>

    </div>

  </header>
)

export default NavBar
