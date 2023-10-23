import React from 'react'
import "./Login.css"

export default function Login() {
  return (
    <>
      <header className="title">
        <img src="music-note.png" id="title-music-logo"></img>
        <h2 id="title-name">MusicMee</h2>
      </header>
      <a href='http://localhost:5000/auth/login' id="login-button">Login</a>
    </>
  )
}
