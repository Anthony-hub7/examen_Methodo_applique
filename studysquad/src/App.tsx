import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { PostsProvider } from './context/PostsContext'

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <AppRoutes />
      </PostsProvider>
    </AuthProvider>
  )
}
export default App
