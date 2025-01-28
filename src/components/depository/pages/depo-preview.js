import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toast } from "../../errorNotifier";
import logo from "../../../pictures/logo.png";
import axios from "axios";

const DepoPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [depo, setDepo] = useState(null);

  useEffect(() => {
    if (location.state && location.state.depo) {
      console.log("THE DEPO", location.state.depo);

      setDepo(location.state.depo);
    } else {
      navigate("/depository");
    }
  }, [depo]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Set the viewport width to 1024 when the component mounts
    const metaTag = document.querySelector('meta[name="viewport"]');
    metaTag.setAttribute("content", "width=1024");

    // Clean up the effect when the component unmounts
    return () => {
      // Restore the original viewport settings
      metaTag.setAttribute("content", "width=device-width, initial-scale=1");
    };
  }, []);

  return (
    <div>
      {depo ? (
        <div>
          <header
            style={{
              backgroundColor: "#05321e",
              color: "#fff",
              textAlign: "center",
              padding: "10px",
            }}
          >
            <img
              style={{ width: "100px", height: "100px", cursor: "pointer" }}
              src={logo}
              alt="logo"
              onClick={() => {
                navigate("/");
              }}
            />
            <h1 style={{ fontSize: "3vw" }}>
              <span style={{ fontStyle: "italic", color: "#f5e559" }}>
                Muslim Community
              </span>
              <br />
              College of Health Science and Technology Funtua
            </h1>
          </header>

          <section
            style={{
              width: "80%",
              margin: "20px auto",
              padding: "20px",
              backgroundColor: "#fff",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              textAlign: "left",
            }}
          >
            <h2
              style={{ textAlign: "center", padding: "20px", fontWeight: 800 }}
            ></h2>

            <p>
              EXTRACT OF THE{" "}
              <span style={{ color: "red" }}>{depo.TypeOfMeeting}</span> MEETING
              HELD ON <span style={{ color: "red" }}>{depo.Date}</span>
            </p>

            <table>
              <tr>
                <td>
                  <b>Subject</b>
                </td>
                <td>{depo.Subject}</td>
              </tr>
              <tr>
                <td>
                  <b>Task</b>
                </td>
                <td>{depo.Task}</td>
              </tr>
              <tr>
                <td>
                  <b>Time Limit</b>
                </td>
                <td>{depo.TimeLimit}</td>
              </tr>

              <tr>
                <td>
                  <b>Person Responsible</b>
                </td>
                <td>{depo.ResponsiblePerson}</td>
              </tr>

              <tr>
                <td>
                  <b>Completion Stage</b>
                </td>
                <td>{depo.CompletionStage}</td>
              </tr>

              <tr>
                <td>
                  <b>Remark</b>
                </td>
                <td>{depo.Remark}</td>
              </tr>

              <tr>
                <td>
                  <b>Status</b>
                </td>
                <td>{depo.Status}</td>
              </tr>
            </table>
          </section>
          <button onClick={handlePrint}>Print</button>
        </div>
      ) : (
        <p>Loading student details...</p>
      )}
    </div>
  );
};

export default DepoPreview;
