import "./App.css";
import { Route, Routes } from "react-router-dom";
import ContactUs from "./components/support";
import ResponsiveManager from "./components/ResponsivenessManager";
import AboutUs from "./components/about";
import { EmailVarificationComponent } from "./components/email-varification/Index";
import { LoginComponent } from "./components/login/Index";
import Registration from "./components/registration/Registration";
import { ApplyComponent } from "./components/apply/apply";
import ApplicantProfile from "./components/user-profile/applicant_profile";
import DashBoard from "./components/admin";
import MainDashboard from "./components/admin/MainDashboard";
import ApplicationComponent from "./components/admin/applicationComponent";
import AdminLoginComponent from "./components/admin/loginComponent";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import FinancialTab from "./components/admin/financeTab";
import { PayNow } from "./components/payment/pay";
import { ForgetPasswordComponent } from "./components/forget-password/Index";
import UsersTab from "./components/admin/users_component";
import SiteAdminTab from "./components/admin/site_admin_component";
import CreateUserTab from "./components/admin/create_users";
import ProtectedUrlRoute from "./components/admin/protectedUrlRoute";
import AdmissionTab from "./components/admin/admissionComponents";
import { AdmissionComponent } from "./components/registration/stage-one/admission";
import ValidationComponent from "./components/registration/validation/validator";
import StudentPortal from "./components/student-portal/portal";
import { AcceptanceComponent } from "./components/registration/acceptance-fee/acceptance";
import StudentProfile from "./components/admin/student_profile";
import IdImageUpload from "./components/idcard/upload";
import PinAuthComponent from "./components/PinAuthComponent";
import DepositoryLoginPage from "./components/depository/pages/login";
import DepositoryPage from "./components/depository/pages/depository";
import DepoPreview from "./components/depository/pages/depo-preview";
import AcceptanceAuthPage from "./components/acceptance-auth";
import StudentDashboard from "./components/student-portal";
import OfficersTab from "./components/admin/officers-tab";
import ListOfApplicantsPage from "./components/admin/pages/list-of-applicants";
import AdmittedStdTab from "./components/admin/pages/list-of-admitted-std";
import RegistrationDownloadsCard from "./components/student-portal/registration-downlods";
import AcademicCalender from "./components/student-portal/academic-calender";
import RegisteredStdTab from "./components/admin/pages/list-of-registered";
import CreateInvoice from "./components/admin/pages/finances/create-invoice";
import InvoicePage from "./components/student-portal/invoices/invoice";
import InvoiceList from "./components/student-portal/invoices/invoices";
import AdminPasswordCreationForm from "./components/create-password";
import StudentPaymentsDashboard from "./components/student-portal/payments/manage-payments";
import ListOfAdminInvoices from "./components/admin/pages/list-of-invoices";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ResponsiveManager />} />
        <Route path="login" element={<LoginComponent />} />
        <Route path="depo-login" element={<DepositoryLoginPage />} />
        <Route path="depository" element={<DepositoryPage />} />
        <Route path="depo-preview" element={<DepoPreview />} />
        <Route
          path="payment"
          element={
            <ProtectedRoute>
              <PayNow />
            </ProtectedRoute>
          }
        />
        <Route
          path="auth"
          element={
            <ProtectedRoute>
              <PinAuthComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="acceptance-auth"
          element={
            <ProtectedRoute>
              <AcceptanceAuthPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="registration"
          element={
            <ProtectedRoute>
              <Registration />
            </ProtectedRoute>
          }
        />
        <Route
          path="reg-1"
          element={
            <ProtectedRoute>
              <AdmissionComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="validation"
          element={
            <ProtectedRoute>
              <ValidationComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="applicant-profile"
          element={
            <ProtectedRoute>
              <ApplicantProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="student-profile"
          element={
            <ProtectedAdminRoute>
              <ProtectedUrlRoute>
                <StudentProfile />
              </ProtectedUrlRoute>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="acceptance"
          element={
            <ProtectedRoute>
              <AcceptanceComponent />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="portal"
          element={
            <ProtectedRoute>
              <StudentPortal />
            </ProtectedRoute>
          }
        /> */}
        <Route path="admin-login" element={<AdminLoginComponent />} />
        <Route
          path="admin"
          element={
            <ProtectedAdminRoute>
              <ProtectedUrlRoute>
                <DashBoard />
              </ProtectedUrlRoute>
            </ProtectedAdminRoute>
          }
        >
          <Route
            path=""
            element={
              <ProtectedUrlRoute>
                <MainDashboard />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="application"
            element={
              <ProtectedUrlRoute>
                <ApplicationComponent />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="create-password"
            element={
              <ProtectedUrlRoute>
                <AdminPasswordCreationForm />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="list-of-applicants"
            element={
              <ProtectedUrlRoute>
                <ListOfApplicantsPage />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="admission"
            element={
              <ProtectedUrlRoute>
                <AdmissionTab />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="list-of-admission"
            element={
              <ProtectedUrlRoute>
                <AdmittedStdTab />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="list-of-registered"
            element={
              <ProtectedUrlRoute>
                <RegisteredStdTab />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="finance"
            element={
              <ProtectedUrlRoute>
                <FinancialTab />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="create-invoice"
            element={
              <ProtectedUrlRoute>
                <CreateInvoice />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="raised-invoices"
            element={
              <ProtectedUrlRoute>
                <ListOfAdminInvoices />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedUrlRoute>
                <UsersTab />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="officers"
            element={
              <ProtectedUrlRoute>
                <OfficersTab />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="create-staff"
            element={
              <ProtectedUrlRoute>
                <CreateUserTab />
              </ProtectedUrlRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedUrlRoute>
                <SiteAdminTab />
              </ProtectedUrlRoute>
            }
          />
        </Route>
        // students portal
        <Route
          path="portal"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<StudentPortal />} />
          <Route path="reg-downloads" element={<RegistrationDownloadsCard />} />
          <Route path="acc-calender" element={<AcademicCalender />} />
          <Route path="invoice" element={<InvoicePage />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route
            path="manage-payments"
            element={<StudentPaymentsDashboard />}
          />
        </Route>
        <Route path="contact" element={<ContactUs />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="varify-email" element={<EmailVarificationComponent />} />
        <Route path="apply" element={<ApplyComponent />} />
        <Route path="pay" element={<PayNow />} />
        <Route path="forget-password" element={<ForgetPasswordComponent />} />
        <Route path="upload" element={<IdImageUpload />} />
      </Routes>
    </div>
  );
}

export default App;
