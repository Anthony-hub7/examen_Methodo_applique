// import AppRoutes from './routes/AppRoutes'
// import { AuthProvider } from './context/AuthContext'
// import { PostsProvider } from './context/PostsContext'

// import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom"
// import Login from "./pages/auth/Login"
// import Signup from './pages/auth/Signup'
// import StatsCard from './components/dashboard/StatsCard'
// import ClientDash from './components/dashboard/ClientDash'
// import DevoirRetard from './components/dashboard/DevoirRetard'

// // import Ghost from './components/ui/Ghost'


// function App() {
//   return (
//   <>
//     <AuthProvider>
//       <PostsProvider>
//         <AppRoutes />
//       </PostsProvider>
//     </AuthProvider>
    
//     {/* <main className="p-8">
//       <h1>Test de connexion Supabase</h1>
//       <p>{status}</p>
//     </main> */}
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signin" element={<Signup />} />
//         <Route path="/card" element={<StatsCard />} />
//         <Route path="/clientDash" element={<ClientDash />} />
//         <Route path="/dev" element={<DevoirRetard />} /> 

//       </Routes>
//     </BrowserRouter>
//     </>

//   )
// }

// export default App
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { PostsProvider } from './context/PostsContext'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <PostsProvider>
        <AppRoutes />
      </PostsProvider>
    </AuthProvider>
  )
}
export default App
