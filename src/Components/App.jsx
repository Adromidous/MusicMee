import React from 'react'
import Homepage from './Homepage.jsx'
import Login from './Login.jsx'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Search from './Search.jsx'

export default function App() {
    return (
        <Router>
            <Routes>
                <Route exact path='/' element={<Login/>}></Route>
                <Route exact path='/home' element={<Homepage/>}></Route>
                <Route exact path='search' element={<Search/>}></Route>
            </Routes>
        </Router>
    );
}