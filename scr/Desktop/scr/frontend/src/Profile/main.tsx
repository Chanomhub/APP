import React from 'react'
import {createRoot} from 'react-dom/client'
import './Profile.css'
import Profile from './Profile'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    
    <React.StrictMode>
    <Profile/>
    </React.StrictMode>
    
        

)
