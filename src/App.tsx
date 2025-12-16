import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CssBaseline, Box, ThemeProvider } from '@mui/material'
import { theme } from './theme/theme'
import { ImportView } from './features/import/ImportView'

function App(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            // background handled in index.css
            '@media print': { background: 'white' }
          }}
        >
          <Routes>
            <Route path="/" element={<ImportView />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App