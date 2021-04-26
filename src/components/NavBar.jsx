import React, { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { IoMdGlobe } from 'react-icons/io'
import classNames from 'classnames'

import { BsInfoCircleFill } from 'react-icons/bs'
import { AiFillCloseCircle } from 'react-icons/ai'

const NavBar = () => {
  const [aboutOpen, setAboutOpen] = useState(false)
  console.log(aboutOpen)
  const height = useMemo(x => {
    if (aboutOpen) {
      return ('h-72 lg:h-60')
    } else {
      return ('h-header md:h-header-md')
    }
  })

  const display_extra = useMemo(x => {
    if (aboutOpen) {
      return ('opacity-100')
    } else {
      return ('hidden opacity-0')
    }
  })

  const display_gisaid = useMemo(x => {
    if (aboutOpen) {
      return ('hidden')
    } else {
      return ('hidden md:inline-block')
    }
  })

  return (
  <header className={classNames('transition-all duration-500 ease-in-out bg-gradient-to-r from-blue-900 to-blue-900', height)}>
    <div className="h-16 flex items-center justify-between container text-white px-4 pt-2">
      <NavLink className="font-bold text-2xl" to="/">
        <span><IoMdGlobe size="1.3em" className="inline-block mr-1 mb-1 "/>CovGlobe</span>
      </NavLink>
      <div className="text-right mr-1  md:pt-8">
      <div className="text-sm font-bold ">
      {aboutOpen && <div className=" cursor-pointer pb-7" onClick={x => setAboutOpen(!aboutOpen)}><AiFillCloseCircle className="inline-block mb-1" size="1.5em"/> Close</div>}
        {!aboutOpen && <span className=" cursor-pointer" onClick={x => setAboutOpen(!aboutOpen)}><BsInfoCircleFill className="inline-block mb-1" size="1.5em"/> About this site</span>}</div>

<div className={classNames('mt-5 ', display_gisaid)}>
      <a href="//gisaid.org"><div className="text-sm opacity-90 hover:opacity-100" to="/">
        <span className="inline">Enabled by data from</span>
        <img src="/schild.png" className="inline-block h-6 ml-1" /><br />
        </div> </a>
<p></p>
      </div></div></div>

      <div className={classNames('px-3 transition-all duration-1000 container text-white text-sm md:text-base', display_extra)}>
        <p className="mb-1 md:mb-3">This site displays genome data from SARS-CoV-2 sequences deposited in the GISAID global database.
          We aggregate two week rolling averages of PANGO lineages in different locations. A select set of lineages are plotted, with other lineages grouped into their parental lineages.</p>

          <p className="mb-1 md:mb-3"><strong>Important caveat:</strong> global sequencing databases are subject to various biases. Within a country, the genomes sampled may represent only a particular region of the country, or predominantly samples identified at the border, or be enriched for samples that have shown a particular testing result such as SGTF. </p>

          <a href="//gisaid.org"><span className="inline">Enabled by data from</span>
        <img src="/schild.png" className="inline-block h-6 ml-1" /><br /></a>
        </div>.
  </header>
  )
}

export default NavBar
