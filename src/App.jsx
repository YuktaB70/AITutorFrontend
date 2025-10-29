import './App.css'
import {
  BrowserRouter,
  Route,
  Routes,
  RouterProvider,
  Link
} from "react-router-dom";
import EditBtns from "./EditBtns";
import UploadPdf from "./UploadPdf";
import AIPDFViewport from './pdfAIViewport';
function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <p>EduTutor AI</p>
      </header>
      <Routes>
        <Route path="/" element={<UploadPdf />} />
      </Routes>
    </div>
  );
}


export default App
