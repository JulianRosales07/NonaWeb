import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './presentation/pages/Login'
import { DashboardLayout } from './presentation/layouts/DashboardLayout'
import { Dashboard } from './presentation/pages/Dashboard'
import { Users } from './presentation/pages/Users'
import { Medications } from './presentation/pages/Medications'
import { Stats } from './presentation/pages/Stats'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
