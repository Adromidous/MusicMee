import React, {useState, useEffect} from 'react'
import './TrackItem.css'

export default function TrackItem (props) {
    const [breakPoint, setBreakPoint] = useState(true);

    async function trackPage() {
        fetch('http://localhost:5000/send-search', {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify(props.track),
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = data.redirect_url;
        });
    }

    function changeUI() {
        if (window.innerWidth > 1300) {
            setBreakPoint(true);
        } else {
            setBreakPoint(false);
        }
    }

    addEventListener('resize', changeUI);

    return (
        <div onClick={trackPage} className="song-details">
            {breakPoint && <img src={props.track.albumUrl} id="song-image" href={props.track.songURL}></img>}
            <div className='song-description'>
                <h3 id="song-title">{props.track.title}</h3>
                <h4 id="song-artist">{`Artist: ${props.track.artist}`}</h4>
            </div>
        </div>
    )  
}