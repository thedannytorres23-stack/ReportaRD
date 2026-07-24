import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reportar" element={<CreateReport />} />
    </Routes>
  );
}