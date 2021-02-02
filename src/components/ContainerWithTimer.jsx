import React, { useState, useEffect } from "react";
import Covid19 from './Covid19'
import Slider from "rc-slider";
import { FaPlay, FaPause } from 'react-icons/fa';

function PlayButton(props) {


  if (!props.playing) {
    return (
      <button onClick={props.onPlay}><FaPlay /></button>
    );
  } else {
    return (
      <button onClick={props.onPause}><FaPause /></button>);
  }
}


function ContainerWithTimer() {
 const [playing,setPlaying] = useState(false)
  const play = () =>{
    setPlaying(true)
    
  }
  
    return (
      <React.Fragment>
        <div className="row">
            <div className="col-md-6" style={{position:'relative'}}>
        <div className="play_control">&nbsp;&nbsp;<PlayButton playing={playing} onPlay={x=>setPlaying(true)} onPause={x=>setPlaying(false)} /></div>
        </div>
        </div>
        <Covid19  playing={playing}/>
      </React.Fragment>
    );
  }
  

export default ContainerWithTimer