import React, {useState, useEffect} from 'react'
import './Search.css'
import SpotifyWebApi from 'spotify-web-api-node';
import SongItem from "./SongItem.jsx";

const spotifyApi = new SpotifyWebApi({
    clientId: "<Enter spotify client ID>",
    clientSecret: "<Enter spotify client secret>"
});

function trackCheck(track1, track2) {
    let averageFeatures = Math.sqrt(((track1.danceability - track2.danceability)**2) + ((track1.energy-track2.energy)**2) + ((track1.instrumentalness-track2.instrumentalness)**2) + ((track1.liveness-track2.liveness)**2) + 
    ((track1.loudness-track2.loudness)**2) + ((track1.speechiness-track2.speechiness)**2) + ((track1.tempo-track2.tempo)**2) + ((track1.valence-track2.valence)**2));

    if (averageFeatures > 50) {
        console.log(averageFeatures);
        return true;
    }

    return false;
}

export default function Search() {
    const [track, setTrack] = useState("");
    const [artistData, setArtistData] = useState("");
    const [followers, setFollowers] = useState("");
    const [trackAttributes, setTrackAttributes] = useState("");
    const [relatedArtists, setRelatedArtists] = useState("");
    const [relatedTracks, setRelatedTracks] = useState([]);
    const [trackItems, setTrackItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/home", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then(data => {
            const obj = JSON.parse(data);

            spotifyApi.setAccessToken(obj.access_token);

            fetch("http://localhost:5000/search", {
                method: "GET",
                headers: { 'Content-Type': 'application/json'},
            }).then(response => response.json())
            .then(async function(data) {

                setTrack(data);

                await spotifyApi.searchArtists(data.artistArray[0]).then(artist => {
                    setArtistData(artist.body.artists.items[0]);
                    setFollowers(artist.body.artists.items[0].followers.total);
                });

                await spotifyApi.getAudioFeaturesForTrack(data.song_id).then(data => {
                    setTrackAttributes({
                        danceability: data.body.danceability,
                        energy: data.body.energy,
                        instrumentalness: data.body.instrumentalness,
                        liveness: data.body.liveness,
                        loudness: data.body.loudness,
                        speechiness: data.body.speechiness,
                        tempo: data.body.tempo,
                        valence: data.body.valence
                    });
                });

                await spotifyApi.getArtistRelatedArtists(data.artist_id).then((artist) => {
                    setRelatedArtists(artist.body.artists); // Getting related artists
                });

            });
        })
    }, []);

    useEffect(() => {
        var relatedSongs = [];
        var songNames = [];
        async function searchData() {
            for (let i = 0; i < relatedArtists.length/2; i++) {
                await spotifyApi.getArtistTopTracks(relatedArtists[i].id, 'CA').then(async (track) => { // Getting top tracks of artist
                    for (let j = 0; j < track.body.tracks.length/2; j++) {

                        if (relatedSongs.length == 10) {
                            break;
                        }

                        if (!(songNames.includes(track.body.tracks[j].name))) {
                            await spotifyApi.getAudioFeaturesForTrack(track.body.tracks[j].id).then(data => {
                                let trackCompare = {
                                    danceability: data.body.danceability,
                                    energy: data.body.energy,
                                    instrumentalness: data.body.instrumentalness,
                                    liveness: data.body.liveness,
                                    loudness: data.body.loudness,
                                    speechiness: data.body.speechiness,
                                    tempo: data.body.tempo,
                                    valence: data.body.valence
                                }
    
                                if (trackCheck(trackCompare, trackAttributes)) {
                                    relatedSongs.push(track.body.tracks[j]);
                                    songNames.push(track.body.tracks[j].name);
                                }
                            })
                        }
                    }
                });
            }
            setRelatedTracks(relatedSongs);
        }; searchData();
    }, [relatedArtists]);

    useEffect(() => {
        setTrackItems(relatedTracks.map((track) => {
            return <li key={track.id}><SongItem track={track}/></li>
        }))

        setLoading(false);
    }, [relatedTracks])

function getAverageRGB(imgEl) {
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
        
    if (!context) {
        return defaultRGB;
    }
    
    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    
    context.drawImage(imgEl, 0, 0);
    
    try {
        data = context.getImageData(0, 0, width, height);   
    } catch(e) {
        console.log(e);
        return defaultRGB;
    }
    
    length = data.data.length;
    
    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    
    return rgb;
}

function colorChange() {
    var rgb = getAverageRGB(document.getElementById('track-image'));
    document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
}

    return (
        <>
            {loading ? (
                <div className="loading-elements">
                    <h1 id="loading-title">Loading...</h1>
                    <img src="./music-note.png" id="note-png"></img>
                </div>
            ) : (
                <div>
                    <header className="main-track">
                    <img src={track.fullDisplayImage} id="track-image" crossOrigin="anonymous" onLoad={colorChange}></img>
                    <div id="track-data">
                        <a href={track.songURL} id="track-title-link" target="_blank">
                            <h1 id="track-title">{track.title}</h1>
                        </a>
                        <h3 id="track-artist">{`Artist: ${track.artist}`}</h3>
                        <h3 id="track-artist-followers">{`Followers: ${followers.toLocaleString('en-US')}`}</h3>
                    </div>
                    </header>
                    <section className="tracks-section">
                        {relatedTracks.length > 0 ? (
                            <ul className="related-tracks">{trackItems}</ul>
                        ) : null};
                    </section>
                </div>
            )}
        </>
    )
}