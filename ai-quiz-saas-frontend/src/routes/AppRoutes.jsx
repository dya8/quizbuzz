import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

import { TeacherLayout } from '../layouts/TeacherLayout';
import { StudentLayout } from '../layouts/StudentLayout';

import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { NotFound } from '../features/auth/NotFound';

import { TeacherDashboard } from '../features/teacher-dashboard/Dashboard';
import { UploadGenerator } from '../features/ai-generator/UploadGenerator';
import { QuestionReview } from '../features/ai-generator/QuestionReview';
import { QuizBuilder } from '../features/teacher-dashboard/QuizBuilder';
import { TeacherQuizzes } from '../features/teacher-dashboard/TeacherQuizzes';
import { TeacherAnalytics } from '../features/teacher-dashboard/Analytics';

import { StudentDashboard } from '../features/student-dashboard/Dashboard';
import { QuizList } from '../features/student-dashboard/QuizList';
import { QuizEngine } from '../features/quiz-engine/QuizEngine';
import { QuizReview } from '../features/quiz-engine/QuizReview';
import { StudentAnalytics } from '../features/student-dashboard/StudentAnalytics';
import { ForgotPassword } from "../features/auth/ForgotPassword";
import { VerifyOtp } from "../features/auth/VerifyOtp";
import { ResetPassword } from "../features/auth/ResetPassword";
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/404" element={<NotFound />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/verify-otp" element={<VerifyOtp />} />
<Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        
        <Route element={<RoleRoute requiredRole="teacher" />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/upload" element={<UploadGenerator />} />
            <Route path="/teacher/review/:batchId" element={<QuestionReview />} />
            <Route path="/teacher/quiz-builder" element={<QuizBuilder />} />
            <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          </Route>
        </Route>

        <Route element={<RoleRoute requiredRole="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/quizzes" element={<QuizList />} />
            <Route path="/student/results/:id" element={<QuizReview />} />
            <Route path="/student/analytics" element={<StudentAnalytics />} />
          </Route>
          
          <Route path="/student/quiz/:id" element={<QuizEngine />} />
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
