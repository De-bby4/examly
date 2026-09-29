import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboardHome from "./pages/student/StudentDashboardHome";
import MyExams from "./pages/student/MyExams";
import ExamHistory from "./pages/student/ExamHistory";
import Notifications from "./pages/student/Notifications";
import Profile from "./pages/student/Profile";
import ExamInstructions from "./pages/student/ExamInstructions";
import TakeExam from "./pages/student/TakeExam";
import ExamResult from "./pages/student/ExamResult";
import AnswerReview from "./pages/student/AnswerReview";
import TeacherLayout from "./layouts/TeachersLayout";
import TeacherDashboardHome from "./pages/teacher/TeacherDashboardHome";
import ManageExams from "./pages/teacher/ManageExams";
import ExamForm from "./pages/teacher/ExamForm";
import QuestionManagement from "./pages/teacher/QuestionManagement";
import ExamResults from "./pages/teacher/ExamResults";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminUsers from "./pages/admin/AdminUsers";
import PendingTeachers from "./pages/admin/PendingTeachers";
import AdminExams from "./pages/admin/AdminExams";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<AdminDashboardHome />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="pending-teachers" element={<PendingTeachers />} />
  <Route path="exams" element={<AdminExams />} />
  <Route path="notifications" element={<TeacherNotifications />} />
  <Route path="profile" element={<TeacherProfile />} />
</Route>
        <Route
  path="/teacher"
  element={
    <ProtectedRoute allowedRoles={["TEACHER"]}>
      <TeacherLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<TeacherDashboardHome />} />
  <Route path="exams" element={<ManageExams />} />
<Route path="exams/new" element={<ExamForm />} />
<Route path="exams/:examId" element={<ExamForm />} />
<Route path="exams/:examId/questions" element={<QuestionManagement />} />
<Route path="exams/:examId/results" element={<ExamResults />} />
<Route path="notifications" element={<TeacherNotifications />} />
<Route path="profile" element={<TeacherProfile />} />
<Route path="analytics" element={<TeacherAnalytics />} />
</Route>
        
        <Route
  path="/student"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <StudentLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<StudentDashboardHome />} />
  <Route path="exams" element={<MyExams />} />
  <Route path="history" element={<ExamHistory />} />
  <Route path="notifications" element={<Notifications />} />
  <Route path="profile" element={<Profile />} />

</Route>

<Route
  path="/student/exams/:examId/instructions"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <ExamInstructions />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/attempts/:attemptId/take"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <TakeExam />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/attempts/:attemptId/result"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <ExamResult />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/attempts/:attemptId/review"
  element={
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <AnswerReview />
    </ProtectedRoute>
  }
/>
      </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;