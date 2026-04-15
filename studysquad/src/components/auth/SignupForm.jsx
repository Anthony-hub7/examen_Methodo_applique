import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabaseClient"
import { Eye, EyeOff ,ArrowRight, ArrowLeft} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Ghost from "../ui/Ghost"

export default function SignupForm() {
  const [step, setStep] = useState(1)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [level, setLevel] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [msg, setMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()

    if (password !== confirm) {
      return setMsg("Les mots de passe ne correspondent pas")
    }

    setMsg("Création...")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, level }
      }
    })

    if (error) setMsg(error.message)
    else setMsg("Compte créé 👍")
  }

  const next = () => setStep((s) => Math.min(s + 1, 3))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div style={styles.container}>
      <video autoPlay muted loop style={styles.videoBg}>
        <source src="/background2.mp4" type="video/mp4" />
      </video>

      <div style={styles.overlay}></div>

      <div style={styles.card}>
        {/* LEFT */}
        <div style={styles.left}>
            <img src="/LogoChap.png" style={styles.logo} />
            <Ghost />
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <form onSubmit={handleSignup} style={styles.form}>

            {/* 🔥 STEPPER */}
            <div style={styles.stepper}>
              {[1,2,3].map((s) => (
                <div key={s} style={styles.stepItem}>
                  <div style={{
                    ...styles.circle,
                    background: step >= s ? "#631319" : "#555"
                  }}>
                    {s}
                  </div>
                </div>
              ))}

              {/* BAR */}
              <motion.div
                style={styles.progress}
                animate={{ width: `${(step - 1) * 50}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* 🔥 FORM STEPS */}
            <AnimatePresence mode="wait">

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                >
                  <input
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                  />

                  <br/>

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                >
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    style={styles.input}
                  >
                    <option  style={{ background: "#222" }}value="">Niveau d'étude</option>
                    <option  style={{ background: "#222" }}>Lycée</option>
                    <option style={{ background: "#222" }}>L1</option>
                    <option style={{ background: "#222" }}>L2</option>
                    <option style={{ background: "#222" }}>L3</option>
                    <option style={{ background: "#222" }}>M1</option>
                    <option style={{ background: "#222" }}>M2</option>
                  </select>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                >
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      {showPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                    </button>
                  </div>

                  <input
                    type="password"
                    placeholder="Confirmer"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    style={styles.input}
                  />
                </motion.div>
              )}

            </AnimatePresence>

            {/* 🔥 BUTTONS */}
            <div style={styles.navBtns}>
              {step > 1 && (
                <button type="button" onClick={prev} 
                style={{ ...styles.buttonAlt, display: "flex", alignItems: "center", gap: "3px", fontSize:"14px"}}
                >
                 <ArrowLeft size={20} />  Retour 
                </button>
              )}

              {step < 3 ? (
                <button type="button" onClick={next} 
                // style={styles.button}
                 style={{ ...styles.button, display: "flex", alignItems: "center", gap: "6px" , fontSize:"14px"}}
                >
                Suivant <ArrowRight size={20} /> 
                </button>
              ) : (
                <button type="submit" style={styles.button}>
                  Créer
                </button>
              )}
            </div>
            <p style={styles.sign} onClick={() => navigate("/login")}>
              Se connecter
            </p>

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
  padding: "300px",
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
left: {
  flex: 1,
  display: "flex",
  flexDirection: "column", 
  justifyContent: "center",
  alignItems: "center",
  gap: "1px", 
},

logo: {
  width: "40%",
  objectFit: "contain",
  marginBottom:"-20px",
  marginRight: "12px"
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
  marginTop: "30px"
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
  marginTop: "15px"
},

stepper: {
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px",
},

stepItem: {
  zIndex: 2
},

circle: {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
},

progress: {
  position: "absolute",
  top: "50%",
  left: 0,
  height: "4px",
  background: "#631319",
  zIndex: 1,
},

navBtns: {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px"
},

buttonAlt: {
  padding: "10px",
  background: "#444",
  color: "white",
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
}
,
select: {
  padding: "10px",
  borderRadius: "20px",
  border: "1px solid #ffffff",
  background: "#ffffff46", 
  color: "white",
  outline: "none",
  width: "100%",
  marginTop: "30px",

  appearance: "none", 
  WebkitAppearance: "none",
  MozAppearance: "none",

  cursor: "pointer",
}
}