import { useState } from "react";
import { Table } from "react-bootstrap";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import {
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import request from "superagent";
import { baseUrl } from "../../../../services/setup";
import { fetchFile } from "../../../../utils/fetch-file";

const StudentTransactionsList = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All Entries");
  const userEmail = localStorage.getItem("userEmail");
  const [transactions, setTransactions] = useState([]);

  const handleFetchData = async () => {
    const trxData = {
      userEmail: userEmail,
    };

    await request
      .post(baseUrl + "transactions/get_transactions_user_id")
      .type("application/json")
      .send(trxData)
      .then((response) => {
        console.log("Transactions response:", response.body);
        setTransactions(response.body);
      })
      .catch((err) => {
        // let errorText = err.response.text;
        // console.log("Error message:", err.response);
      });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const filteredTransactions =
    filter === "All Entries"
      ? transactions
      : transactions.filter((trx) => trx.status === filter);

  const handleTransactionClick = (id) => {
    const transactionData = filteredTransactions.find(
      (trx) => trx.transaction_id === id
    );

    navigate(`/portal/invoice`, {
      state: { transactionData: transactionData },
    });
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <MDBDropdown group className="shadow-0">
          <MDBDropdownToggle color="light">{filter}</MDBDropdownToggle>
          <MDBDropdownMenu>
            <MDBDropdownItem link onClick={() => setFilter("All Entries")}>
              All Entries
            </MDBDropdownItem>
            <MDBDropdownItem link onClick={() => setFilter("Paid")}>
              Paid
            </MDBDropdownItem>
            <MDBDropdownItem link onClick={() => setFilter("UnPaid")}>
              UnPaid
            </MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </div>

      <Table hover responsive bordered>
        <thead>
          <tr>
            <th>Transaction ID #</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Net</th>
            <th>User ID</th>
            <th>Description</th>
            <th>Print Receipt</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr
              key={index}
              //   style={{ cursor: "pointer" }}
            >
              <td>{transaction.TransactionID}</td>
              <td>{transaction.Date}</td>
              <td>{transaction.Amount}</td>
              <td>{transaction.Net}</td>
              <td>{transaction.UserID}</td>
              <td>{transaction.Details}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const data = {
                      pay_code: transaction.TransactionID,
                      mode: "transaction",
                    };
                    fetchFile(
                      "https://api.mcchstfuntua.edu.ng/data/receipt/index.php",
                      data,
                      "Printing",
                      "Please wait...",
                      "receipt.pdf"
                    );
                  }}
                >
                  Print
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentTransactionsList;
