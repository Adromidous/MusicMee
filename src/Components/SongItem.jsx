import React from 'react'
import './SongItem.css'

export default function SongItem(props) {
    return (
        <>
            <div className="track-details">
                <img src={props.track.album.images[2].url} id="track-image"></img>
                <div className="track-information">
                    <a href={props.track.external_urls.spotify} target="_blank" id="track-title-link">
                        <h4 id="track-title">{props.track.name}</h4>
                    </a>
                    <h5 id="track-artists">{props.track.artists[0].name}</h5>
                </div>
            </div>
        </>
    )
}