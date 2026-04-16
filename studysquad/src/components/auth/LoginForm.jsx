import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabaseClient"
import { Eye, EyeOff } from "lucide-react"
import Ghost from "../ui/Ghost"
import data from "../../services/dataAdmin.json"


export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // const handleLogin = async (e) => {
  //   e.preventDefault()

  //   setMsg("Connexion...")

  //   const { error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   })

  //   if (error) {
  //     setMsg(error.message)
  //   } else {
  //     setMsg("Connexion réussie 👍")
  //   }
  // }
  const navigate = useNavigate()
// const handleLogin = (e) => {
//   e.preventDefault()

//   const user = data.user || data.client
//   if (!user) {
//     setMsg("Email ou mot de passe incorrect")
//     console.log("Email ou mot de passe incorrect");
//     return
//   }

//   setMsg("Connexion réussie 👍")
//     console.log("Connexion réussie 👍");

// if (email === user.email && password === user.password) {
//   console.log("OK")
//   if(user.role == "admin") navigate("/card")
//   else navigate ("/clientStat")
// } else {
//   setMsg("Login incorrect")
// }
// }

const handleLogin = (e) => {
  e.preventDefault()

  const users = [data.user, data.client]

  const foundUser = users.find(
    (u) => u.email === email && u.password === password
  )

  if (!foundUser) {
    setMsg("Login incorrect")
    return
  }

  setMsg("Connexion réussie 👍")

  if (foundUser.role === "admin") {
    navigate("/card")
  } else {
    navigate("/clientDash")
  }
}

  //ghost
  const [ghostMode, setGhostMode] = useState("idle")
const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

const handleMouseMove = (e) => {
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight
  
  setMousePos({ x, y })
}

  return (
  <div style={styles.container}>

    {/* VIDEO BACKGROUND */}
    <video autoPlay muted loop style={styles.videoBg}>
      <source src="/background2.mp4" type="video/mp4" />
    </video>

    {/* OVERLAY */}
    <div style={styles.overlay}></div>

    <div style={styles.card}>

      {/* LEFT IMAGE */}
      <div style={styles.left}>
        <div style={styles.GhostBox}>
        <Ghost/>

        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={styles.right}>
        <form
        //  onSubmit={handleLogin}
        onSubmit={(e) => {
    console.log("FORM SUBMIT")
    handleLogin(e)
  }}
        
        style={styles.form}>
          <img src="/Logo.png" style={{ width: "90%" }} />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          
         <div style={{ position: "relative", width: "100%" }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ ...styles.input, paddingRight: "40px" }}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={styles.eyeBtn}
  >
    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
</div>

          <br/>
          <button type="submit" style={styles.button}>
            Se connecter
          </button>
          <p style={styles.sign}
          onClick={() => navigate("/signin")}
          >S'inscrire</p>
          <p>{msg}</p>

        </form>
      </div>

    </div>
  </div>
)
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    color: "white",
  },

  videoBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    // background: "#63131891", 
    background : "#00000086",
    zIndex: 1,
  },

  form: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    background: "rgba(0, 0, 0, 0.64)",
    borderRadius: "20px",
    width: "300px",
    backdropFilter: "blur(10px)",
  },

 input: {
  padding: "10px",
  borderRadius: "20px",
  border: "1px solid #ffffff",
  background: "#ffffff46",
  color: "white",
  outline: "none",
  transition: "0.2s",
},

inputFocus: {
  border: "1px solid #631319",
  boxShadow: "0 0 8px #63131966",
},

  button: {
    padding: "10px",
    background: "#631319",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },
  card: {
  position: "relative",
  zIndex: 2,
  display: "flex",
  width: "800px",
  height: "450px",
  borderRadius: "15px",
  overflow: "hidden",
  backdropFilter: "blur(10px)",
  background: "rgba(0,0,0,0.4)",
},

left: {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  position: "relative",
},

image: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
},

right: {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},

form: {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "80%",
},
ghostBox: {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
},
sign: {
  color: "#631319",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "500",
  marginLeft: "auto", 
  fontSize:"14px",
  cursor: "pointer",
  
},

input: {
  padding: "10px 40px 10px 10px", 
  borderRadius: "20px",
  border: "1px solid #ffffff",
  background: "#ffffff46",
  color: "white",
  outline: "none",
  width: "100%", 
},

eyeBtn: {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}
}