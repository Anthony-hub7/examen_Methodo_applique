import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { DevoirProvider } from './context/DevoirContext'
import { GroupProvider } from './context/GroupContext'

function App() {
  return (
    <AuthProvider>
      <DevoirProvider>
        <GroupProvider>
          <AppRoutes />
        </GroupProvider>
      </DevoirProvider>
    </AuthProvider>
  )
}

export default App
