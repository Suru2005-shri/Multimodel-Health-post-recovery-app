import { useState, useEffect } from "react";
import T from "../../constants/theme";
import Btn     from "../../components/ui/Btn";
import Spinner from "../../components/ui/Spinner";
import {
  passStrength, seedKnownUsers,
  validateLogin, validateSignup, registerUser,
} from "../../utils/auth";

export default function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup]     = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [pass,        setPass]        = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  useEffect(() => { seedKnownUsers(); }, []);

  const reset = () => { setError(""); setSuccess(""); };
  const strength = passStrength(pass);

  const IS = {
    width: "100%", padding: "0.85rem 1rem", borderRadius: 12,
    border: "none", background: T.s1, color: T.ink,
    fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif",
  };

  /* ── Handlers ── */
  const handleLogin = async () => {
    reset();
    const res = validateLogin(email, pass);
    if (!res.ok) { setError(res.error); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    onLogin(res.user);
  };

  const handleSignup = async () => {
    reset();
    const res = validateSignup(name, email, pass, confirmPass);
    if (!res.ok) { setError(res.error); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    const newUser = registerUser(name, email, pass);
    onLogin(newUser, true); // true = go to profile setup
  };

  const handleForgot = async () => {
    reset();
    if (!email.trim()) { setError("Enter your email address to reset password."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setForgotSent(true);
    setSuccess(`Reset link sent to ${email.trim().toLowerCase()}`);
  };

  const switchTab = val => { setIsSignup(val); reset(); setPass(""); setConfirmPass(""); };

  /* ── Render ── */
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(145deg,#e8f0fe 0%,${T.surface} 45%,#e6f7ec 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem", position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position:"absolute", top:-80, left:-80, width:320, height:320, borderRadius:"50%", background:`${T.primary}0d`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-60, right:-60, width:260, height:260, borderRadius:"50%", background:`${T.green}0d`,   pointerEvents:"none" }}/>

      <div className="su" style={{
        background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px)",
        borderRadius: 28, padding: "2.5rem", maxWidth: 440, width: "100%",
        boxShadow: "0 32px 80px rgba(0,88,188,.13), 0 2px 8px rgba(0,0,0,.06)",
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{
            width:64, height:64, borderRadius:20, margin:"0 auto 12px",
            background:`linear-gradient(135deg,${T.primary},${T.pc})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.85rem", boxShadow:`0 8px 24px ${T.primary}35`,
          }}>🫀</div>
          <div className="M" style={{ fontWeight:800, fontSize:"1.45rem", color:T.ink }}>Health Recovery AI</div>
          <div style={{ fontSize:"0.75rem", color:T.ink2, marginTop:4, letterSpacing:"0.02em" }}>
            Intelligent Health Monitoring System
          </div>
        </div>

        {/* ── FORGOT PASSWORD MODE ── */}
        {forgotMode ? (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.5rem" }}>
              <button onClick={() => { setForgotMode(false); setForgotSent(false); reset(); }}
                style={{ background:"none", border:"none", color:T.primary, cursor:"pointer", fontSize:"1rem" }}>←</button>
              <div className="M" style={{ fontWeight:700, fontSize:"1rem", color:T.ink }}>Reset Password</div>
            </div>
            {error   && <Banner type="error"   msg={error}   />}
            {success && <Banner type="success" msg={success} />}
            {!forgotSent ? (
              <>
                <div style={{ fontSize:"0.8rem", color:T.ink2, marginBottom:"1.25rem", lineHeight:1.6 }}>
                  Enter your registered email and we'll send a reset link.
                </div>
                <input type="email" placeholder="Email address" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleForgot()}
                  style={{ ...IS, marginBottom:"1.25rem" }}/>
                <Btn onClick={handleForgot} variant="primary" size="lg" style={{ width:"100%" }} disabled={loading}>
                  {loading ? <LoadText text="Sending..." /> : "Send Reset Link →"}
                </Btn>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:10 }}>📧</div>
                <div className="M" style={{ fontWeight:700, fontSize:"1rem", color:T.green, marginBottom:6 }}>Reset link sent!</div>
                <div style={{ fontSize:"0.8rem", color:T.ink2, lineHeight:1.6, marginBottom:"1.5rem" }}>
                  Check your inbox at <strong>{email}</strong> and follow the instructions.
                </div>
                <Btn onClick={() => { setForgotMode(false); setForgotSent(false); reset(); }} variant="ghost" size="md">
                  Back to Sign In
                </Btn>
              </div>
            )}
          </>
        ) : (
          /* ── SIGN IN / SIGN UP ── */
          <>
            {/* Tab bar */}
            <div style={{ display:"flex", background:T.s2, borderRadius:12, padding:3, marginBottom:"1.5rem" }}>
              {[["Sign In",false],["Sign Up",true]].map(([lbl,val]) => (
                <button key={lbl} onClick={() => switchTab(val)} style={{
                  flex:1, padding:"0.6rem", borderRadius:10, border:"none",
                  background: isSignup===val ? T.s0 : "transparent",
                  color:      isSignup===val ? T.primary : T.ink2,
                  fontFamily: "Manrope", fontWeight:700, fontSize:"0.85rem",
                  boxShadow:  isSignup===val ? "0 2px 10px rgba(0,0,0,.08)" : "none",
                  transition: "all .22s",
                }}>{lbl}</button>
              ))}
            </div>

            {error   && <Banner type="error"   msg={error}   />}
            {success && <Banner type="success" msg={success} />}

            {/* Full Name */}
            <Field label="Full Name">
              <input placeholder={isSignup ? "e.g. Arjun Mehta" : "Your name"} value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key==="Enter" && (isSignup ? handleSignup() : handleLogin())}
                style={IS}/>
            </Field>

            {/* Email */}
            <Field label="Email Address">
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key==="Enter" && (isSignup ? handleSignup() : handleLogin())}
                style={IS}/>
            </Field>

            {/* Password */}
            <Field label="Password" mb={isSignup ? "0.75rem" : "0.5rem"}>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"}
                  placeholder={isSignup ? "Min 8 chars, 1 uppercase, 1 number" : "Enter your password"}
                  value={pass} onChange={e => setPass(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && !isSignup && handleLogin()}
                  style={{ ...IS, paddingRight:"3rem" }}/>
                <EyeBtn show={showPass} toggle={() => setShowPass(p => !p)}/>
              </div>
              {isSignup && pass && (
                <div style={{ marginTop:6 }}>
                  <div style={{ height:4, background:T.s3, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:2, transition:"all .3s", width:`${(strength.score/5)*100}%`, background:strength.color }}/>
                  </div>
                  <div style={{ fontSize:"0.68rem", color:strength.color, fontWeight:600, marginTop:3 }}>{strength.label}</div>
                </div>
              )}
            </Field>

            {/* Confirm password — signup only */}
            {isSignup && (
              <Field label="Confirm Password">
                <div style={{ position:"relative" }}>
                  <input type={showConfirm?"text":"password"} placeholder="Re-enter your password"
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && handleSignup()}
                    style={{ ...IS, paddingRight:"3rem",
                      outline: confirmPass && confirmPass!==pass ? `2px solid ${T.red}`   :
                               confirmPass && confirmPass===pass ? `2px solid ${T.green}` : "none" }}/>
                  <EyeBtn show={showConfirm} toggle={() => setShowConfirm(p => !p)}/>
                  {confirmPass && <span style={{ position:"absolute", right:42, top:"50%", transform:"translateY(-50%)", fontSize:"0.9rem" }}>
                    {confirmPass===pass?"✅":"❌"}
                  </span>}
                </div>
              </Field>
            )}

            {/* Rules checklist — signup */}
            {isSignup && (
              <div style={{ background:T.s1, borderRadius:10, padding:"0.7rem 0.9rem", marginBottom:"1.25rem" }}>
                {[
                  { rule:"At least 8 characters",    ok: pass.length >= 8 },
                  { rule:"One uppercase letter",      ok: /[A-Z]/.test(pass) },
                  { rule:"One number",                ok: /[0-9]/.test(pass) },
                  { rule:"Passwords match",           ok: pass===confirmPass && confirmPass.length>0 },
                ].map(r => (
                  <div key={r.rule} style={{ display:"flex", alignItems:"center", gap:"0.45rem", padding:"2px 0", fontSize:"0.72rem", color: r.ok ? T.green : T.ink2 }}>
                    <span>{r.ok?"✅":"○"}</span>{r.rule}
                  </div>
                ))}
              </div>
            )}

            {/* Forgot password link */}
            {!isSignup && (
              <div style={{ textAlign:"right", marginBottom:"1.25rem" }}>
                <button onClick={() => { setForgotMode(true); reset(); }}
                  style={{ background:"none", border:"none", color:T.primary, fontSize:"0.75rem", fontWeight:600, cursor:"pointer", textDecoration:"underline" }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <Btn onClick={isSignup?handleSignup:handleLogin} variant="primary" size="lg"
              style={{ width:"100%" }} disabled={loading}>
              {loading
                ? <LoadText text={isSignup?"Creating account...":"Signing in..."} />
                : isSignup ? "Create Account →" : "Sign In →"}
            </Btn>

            {/* Switch link */}
            <div style={{ textAlign:"center", marginTop:"1.25rem", fontSize:"0.78rem", color:T.ink2 }}>
              {isSignup
                ? <>Already have an account?{" "}
                    <button onClick={() => switchTab(false)} style={{ background:"none", border:"none", color:T.primary, fontWeight:700, cursor:"pointer", fontSize:"0.78rem" }}>Sign In</button></>
                : <>Don't have an account?{" "}
                    <button onClick={() => switchTab(true)}  style={{ background:"none", border:"none", color:T.primary, fontWeight:700, cursor:"pointer", fontSize:"0.78rem" }}>Sign Up</button></>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function Field({ label, children, mb = "0.75rem" }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:T.ink2, marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function Banner({ type, msg }) {
  const bg = type === "error" ? `${T.red}12`   : `${T.green}12`;
  const c  = type === "error" ? T.red           : T.green;
  const ic = type === "error" ? "⚠"             : "✅";
  return (
    <div style={{ background:bg, color:c, borderRadius:10, padding:"0.65rem 1rem", fontSize:"0.78rem", marginBottom:"1rem", fontWeight:500, display:"flex", alignItems:"flex-start", gap:"0.5rem", lineHeight:1.5 }}>
      <span style={{ flexShrink:0 }}>{ic}</span>{msg}
    </div>
  );
}

function EyeBtn({ show, toggle }) {
  return (
    <button onClick={toggle} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"1rem", color:T.ink2, lineHeight:1 }}>
      {show ? "🙈" : "👁"}
    </button>
  );
}

function LoadText({ text }) {
  return (
    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
      <Spinner /> {text}
    </span>
  );
}
