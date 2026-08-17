import "./App.css";
import { Route, Routes } from "react-router-dom";
import ContactUs from "./components/support";
import ResponsiveManager from "./components/ResponsivenessManager";
import AboutUs from "./components/about";
import { EmailVarificationComponent } from "./components/email-varification/Index";
import { LoginComponent } from "./components/login/Index";
import Registration from "./components/registration/Registration";
import NinVerification from "./components/registration/NinVerification";
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
import { UsersPage } from "./features/users";
import SiteAdminTab from "./components/admin/site_admin_component";
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
import Officers from "./features/officers/Officers";
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
import UndertakingPage from "./components/student-portal/undertakings/UndertakingPage";
import ListOfAdminInvoices from "./components/admin/pages/list-of-invoices";
import StudentTransactionsList from "./pages/students/payments/transactons/Transactions";
import AcademicSessionManagement from "./pages/admin/academic-session-management";
import EditInvoice from "./pages/admin/finance/EditInvoice";
import EditUserPage from "./features/users/pages/EditUserPage";
import CreateUser from "./features/users/components/CreateUser";
import UpdateCsvUploaded from "./pages/students/registration/data_update/UpdateCsvUploaded";
import Scholarship from "./pages/admin/officers/Registrar/Scholarship";
import SchInvoicePage from "./pages/admin/officers/Registrar/SchInvoice";
import InvoicesReport from "./features/finance/components/InvoicesReport";
import RegistrarUndertakings from "./components/admin/officers-tabs/registrar";
import UndertakingTrackerPage from "./pages/admin/officers/UndertakingTrackerPage";
import DocumentRequirements from "./features/officers/components/RegistrarPanel/DocumentRequirements";
import HODReports from "./features/officers/hod/HODReports";
import StudentsAdmission from "./features/officers/hod/StudentAdmission";
import RegistrarAdmissions from "./features/officers/registrar/RegistrarAdmissions";
import HODHostelReports from "./features/officers/hod/HODHostelReports";
import FundsTransfer from "./features/finance/components/FundsTransfer";
import ManualPayment from "./features/finance/components/ManualPayment";
import SettlementCreation from "./features/finance/components/SettlementCreation";
import AccountReconciliation from "./features/finance/components/AccountReconciliation";
import InvoiceSyncPage from "./features/finance/components/InvoiceSyncPage";
import CourseManagement from "./features/officers/hod/CourseManagement";
import StudentCourseRegistration from "./pages/students/registration/CourseRegistration";
import RegistrarClearance from "./features/clearance/RegistrarClearance";
import SAOClearance from "./features/clearance/SAOClearance";
import AccountClearance from "./features/clearance/AccountClearance";
import HODClearance from "./features/clearance/HODClearance";
import StationariesRegistration from "./features/registrar/StationariesRegistration";
import StationaryCollection from "./features/account/StationaryCollection";
import StudentClearance from "./components/student-portal/clearance/StudentClearance";
import VerifyClearance from "./pages/clearance/VerifyClearance";
import ExitCardList from "./features/hostel/ExitCardList";
import StudentsFinancesReport from "./features/finance/components/StudentsFinancesReport";
import StudentsIdCard from "./pages/admin/students-id-card/StudentsIdCard";
import MaintenancePage from "./components/maintenance/MaintenancePage";

const getMaintenanceMode = () => {
  const config = window.MCCHST_MAINTENANCE || {};
  return config.enabled === true && config.restoreFullFunction !== true;
};

function App() {
  if (getMaintenanceMode()) {
    return <MaintenancePage />;
  }

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
          path="registration/nin-verification"
          element={
            <ProtectedRoute>
              <NinVerification />
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
          path="csv-update"
          element={
            <ProtectedRoute>
              <UpdateCsvUploaded />
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
            path="academic-session-management"
            element={
              <ProtectedUrlRoute>
                <AcademicSessionManagement />
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
            path="finance/settlement-creation"
            element={
              <ProtectedUrlRoute>
                <SettlementCreation />
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
            path="student-finance-report"
            element={
              <ProtectedUrlRoute>
                <StudentsFinancesReport />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="account-reconciliation"
            element={
              <ProtectedUrlRoute>
                <AccountReconciliation />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="edit-invoice"
            element={
              <ProtectedUrlRoute>
                <EditInvoice />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="edit-users"
            element={
              <ProtectedUrlRoute>
                <EditUserPage />
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
            path="invoices-report"
            element={
              <ProtectedUrlRoute>
                <InvoicesReport />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="invoice-sync"
            element={
              <ProtectedUrlRoute>
                <InvoiceSyncPage />
              </ProtectedUrlRoute>
            }
          />

          {/* HOD shortcut into undertaking queue (defaults to HOD stage) */}
          <Route
            path="hod-undertakings"
            element={
              <ProtectedUrlRoute>
                <RegistrarUndertakings stage="hod" />
              </ProtectedUrlRoute>
            }
          />

          {/* Registrar shortcut into undertaking queue (defaults to Registrar stage) */}
          <Route
            path="registrar-undertakings"
            element={
              <ProtectedUrlRoute>
                <RegistrarUndertakings stage="registrar" />
              </ProtectedUrlRoute>
            }
          />

          {/* Quality Assurance undertaking reports – expiry tracking */}
          <Route
            path="undertaking-reports"
            element={
              <ProtectedUrlRoute>
                <UndertakingTrackerPage />
              </ProtectedUrlRoute>
            }
          />

          {/* Registrar admission approvals */}
          <Route
            path="registrar-admissions"
            element={
              <ProtectedUrlRoute>
                <RegistrarAdmissions />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="registrar-clearance"
            element={
              <ProtectedUrlRoute>
                <RegistrarClearance />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="registrar-stationaries"
            element={
              <ProtectedUrlRoute>
                <StationariesRegistration />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="account-clearance"
            element={
              <ProtectedUrlRoute>
                <AccountClearance />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="stationary-collection"
            element={
              <ProtectedUrlRoute>
                <StationaryCollection />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="sao-clearance"
            element={
              <ProtectedUrlRoute>
                <SAOClearance />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="hod-clearance"
            element={
              <ProtectedUrlRoute>
                <HODClearance />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="hostel-reports"
            element={
              <ProtectedUrlRoute>
                <HODHostelReports />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="exit-card-list"
            element={
              <ProtectedUrlRoute>
                <ExitCardList />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="students-id-card"
            element={
              <ProtectedUrlRoute>
                <StudentsIdCard />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="funds-transfer"
            element={
              <ProtectedUrlRoute>
                <FundsTransfer />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="manual-payment"
            element={
              <ProtectedUrlRoute>
                <ManualPayment />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedUrlRoute>
                <UsersPage />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="officers"
            element={
              <ProtectedUrlRoute>
                <Officers />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="scholarship"
            element={
              <ProtectedUrlRoute>
                <Scholarship />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="registration-docs"
            element={
              <ProtectedUrlRoute>
                <DocumentRequirements />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="dept-reports"
            element={
              <ProtectedUrlRoute>
                <HODReports />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="confirm-admission"
            element={
              <ProtectedUrlRoute>
                <StudentsAdmission />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="course-management"
            element={
              <ProtectedUrlRoute>
                <CourseManagement />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="view-invoice"
            element={
              <ProtectedUrlRoute>
                <SchInvoicePage />
              </ProtectedUrlRoute>
            }
          />

          <Route
            path="create-staff"
            element={
              <ProtectedUrlRoute>
                <CreateUser />
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
        {/* students portal */}
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

          <Route path="transactions" element={<StudentTransactionsList />} />
          <Route
            path="manage-payments"
            element={<StudentPaymentsDashboard />}
          />
          <Route path="undertakings" element={<UndertakingPage />} />
          <Route
            path="course-registration"
            element={<StudentCourseRegistration />}
          />
          <Route path="clearance" element={<StudentClearance />} />
        </Route>
        <Route path="contact" element={<ContactUs />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="varify-email" element={<EmailVarificationComponent />} />
        <Route path="apply" element={<ApplyComponent />} />
        <Route path="verify-clearance" element={<VerifyClearance />} />
        <Route path="pay" element={<PayNow />} />
        <Route path="forget-password" element={<ForgetPasswordComponent />} />
        <Route path="upload" element={<IdImageUpload />} />
      </Routes>
    </div>
  );
}

export default App;
