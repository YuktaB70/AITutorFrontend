import { useNavigate } from "react-router-dom";
import './App.css'

function EditBtns() {
  return (
        <div className="actions-row">
            <EditBtnRouter label="Edit PDF" to="/editPdf"/>
            {/* <EditBtnRouter label="Merge PDF" to="/editPdf"/>
            <EditBtnRouter label="Split PDF" to="/editPdf"/> */}

        </div>
  );

}

function EditBtnRouter({label, to}){
  const navigate = useNavigate();
  return (
    <button className="action-btn" onClick={() => navigate(to)}>
      <p>{label}</p>

    </button>
  )
}

export default EditBtns;