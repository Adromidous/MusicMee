import React, {useState, useEffect} from 'react'
import './Homepage.css'
import SpotifyWebApi from 'spotify-web-api-node';
import TrackItem from "./TrackItem.jsx";

const spotifyApi = new SpotifyWebApi({
  clientId: "<Enter Spotify Client ID>",
  clientSecret: "<Enter Spotify Client Secret"
});

export default function Homepage() {
  const [refresh_token, setRefreshToken] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [songItems, setSongItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/home", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => response.json())
    .then(data => {
      const obj = JSON.parse(data);
      setRefreshToken(obj.refresh_token);

      spotifyApi.setAccessToken(obj.access_token);
    })

  }, [])

  useEffect(() => {
    let trackSet = []
    if (search.length > 0) {
      spotifyApi.searchTracks(search).then(res => {
        setSearchResults(res.body.tracks.items.slice(0,5).map(track => {
          var allArtists = [];

          track.artists.map(artist => allArtists.push(artist.name));

          if (!(trackSet.includes(track.name))) {

            trackSet.push(track.name);

            return {
              artistArray: allArtists,
              artist: allArtists.join(', '),
              artist_id: track.artists[0].id,
              title: track.name,
              uri: track.uri,
              albumUrl: track.album.images[0].url,
              fullDisplayImage: track.album.images[1].url,
              songURL: track.external_urls.spotify,
              song_id: track.id
            }
          }

          return null;
          
        }))
      })
    
    setSongItems(searchResults.map(track => {
      if (track !== null) {
        return <li key={track.uri}><TrackItem track={track}/></li>
      }
    }))

  }else {
    setSearchResults([]);
    setSongItems([]);
  }

  }, [search])

  function click() {
    document.getElementById('song-input').value = "";
  }

  const change = event => {
    setSearch(event.target.value);
  }

  return (
    <>
      <header>
        <div className="header">
          <div className="homepage-logo">
            <img src="./music-note.png" id="note-png"></img>
            <h2>MusicMee</h2>
          </div>
          <a href="http://localhost:5000/logout" id="logout">Logout</a>
        </div>
      </header>
      <section className="song-field">
        <input onChange={change} placeholder="Enter a song..." type="text" id="song-input"></input>
        {songItems.length > 0 ? (
            <ul className="song-dropdown" onClick={click}>{songItems}</ul>
        ) : null}
      </section>
    </>
  )
}
