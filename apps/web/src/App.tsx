import { Routes, Route } from "react-router-dom";
import { Login } from "./components/Login";
import { Home } from "./components/Home";
import { Usuarios } from "./components/Usuarios";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="/usuarios" element={<Usuarios />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
