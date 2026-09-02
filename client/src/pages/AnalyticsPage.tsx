import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  BookOpen,
  History,
  RotateCcw,
  UserPlus,
  ArrowRight,
  Activity,
  Layers,
  Calendar,
  Clock,
} from 'lucide-react';
import { getAnalytics, getActivityLogs } from '../api/students';
import type { AnalyticsResponse, ActivityLog } from '../api/students';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage: React.FC = () => {
  const toast = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [analyticsRes, activityRes] = await Promise.all([
        getAnalytics(),
        getActivityLogs(),
      ]);
      setAnalytics(analyticsRes);
      setActivityLogs(activityRes.data || []);
      if (isManual) {
        toast.success('Analytics data refreshed successfully.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analytics data';
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []); // Stable callback without dynamic dependencies

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Strictly run once on mount with empty dependency array

  const totalStudents = analytics?.total_students || 0;
  const courseData = analytics?.by_course || [];
  const yearData = analytics?.by_year || [];

  // Action Badge Helper
  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case 'CREATE_STUDENT':
        return {
          label: 'Enrolled',
          className: 'bg-[var(--clay-success)] text-white',
        };
      case 'UPDATE_STUDENT':
        return {
          label: 'Updated',
          className: 'bg-[var(--clay-highlight)] text-[#4A3226]',
        };
      case 'DELETE_STUDENT':
        return {
          label: 'Deleted',
          className: 'bg-[var(--clay-danger)] text-white',
        };
      case 'BULK_DELETE_STUDENTS':
        return {
          label: 'Bulk Deleted',
          className: 'bg-[var(--clay-danger)] text-white',
        };
      default:
        return {
          label: actionType.replace('_', ' '),
          className: 'bg-[var(--clay-surface)] text-[var(--clay-text)]',
        };
    }
  };

  // Format timestamp helper
  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Actions */}
      <section className="clay-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="clay-badge-inset p-1.5 text-[var(--clay-primary)]">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--clay-text)] tracking-tight m-0">
              Analytics & Insights
            </h2>
          </div>
          <p className="text-sm text-[var(--clay-text-secondary)] font-medium mt-1 mb-0">
            Real-time enrollment metrics, course distributions, and administrative audit logs
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="clay-btn px-4 py-2.5 text-xs sm:text-sm font-semibold gap-2 text-[var(--clay-text)]"
            title="Refresh analytics data"
            id="refresh-analytics-btn"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link
            to="/students/new"
            className="clay-btn-primary px-4 py-2.5 text-xs sm:text-sm font-semibold gap-2 rounded-2xl"
            id="analytics-add-student-btn"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add student</span>
          </Link>
        </div>
      </section>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Enrolled */}
        <div className="clay-card p-6 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--clay-primary)',
              color: '#FFFFFF',
              boxShadow: '4px 4px 10px rgba(217, 119, 87, 0.4), -4px -4px 10px var(--clay-shadow-light)',
            }}
          >
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--clay-text-secondary)] uppercase tracking-wider">
              Total Enrolled Students
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--clay-text)] mt-0.5">
              {isLoading ? '...' : totalStudents}
            </div>
          </div>
        </div>

        {/* Card 2: Active Courses */}
        <div className="clay-card p-6 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--clay-accent)',
              color: '#FFFFFF',
              boxShadow: '4px 4px 10px rgba(232, 168, 124, 0.4), -4px -4px 10px var(--clay-shadow-light)',
            }}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--clay-text-secondary)] uppercase tracking-wider">
              Active Programs
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--clay-text)] mt-0.5">
              {isLoading ? '...' : courseData.length}
            </div>
          </div>
        </div>

        {/* Card 3: Activity Logs Count */}
        <div className="clay-card p-6 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--clay-success)',
              color: '#FFFFFF',
              boxShadow: '4px 4px 10px rgba(143, 174, 125, 0.4), -4px -4px 10px var(--clay-shadow-light)',
            }}
          >
            <History className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--clay-text-secondary)] uppercase tracking-wider">
              Audit Logs Captured
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--clay-text)] mt-0.5">
              {isLoading ? '...' : activityLogs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Course Enrollments Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Enrollments by Course Panel */}
          <section className="clay-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--clay-border)]/60 pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[var(--clay-primary)]" />
                <h3 className="text-lg md:text-xl font-bold text-[var(--clay-text)] m-0">
                  Enrollments by Course
                </h3>
              </div>
              {courseData.length > 0 && (
                <span className="clay-badge-inset px-3 py-1 text-xs font-bold text-[var(--clay-text)]">
                  {courseData.length} Course{courseData.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4 py-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={`skel-bar-${n}`} className="space-y-2 animate-pulse">
                    <div className="w-1/3 h-4 rounded bg-[var(--clay-border)]" />
                    <div className="w-full h-7 rounded-xl bg-[var(--clay-border)]" />
                  </div>
                ))}
              </div>
            ) : courseData.length === 0 ? (
              /* Styled Claymorphic Empty State (ZERO Dummy Data) */
              <div className="clay-badge-inset p-8 text-center rounded-2xl space-y-4 my-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--clay-surface)] text-[var(--clay-text-secondary)] flex items-center justify-center shadow-sm">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--clay-text)] m-0">
                    No enrollment data available
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--clay-text-secondary)] font-medium mt-1 max-w-sm mx-auto">
                    Enroll students in academic courses to view dynamic distribution charts and analytics.
                  </p>
                </div>
                <Link
                  to="/students/new"
                  className="clay-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex gap-2 rounded-xl"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll first student</span>
                </Link>
              </div>
            ) : (
              /* Dynamic Claymorphic Bar Chart */
              <div className="space-y-5 pt-2">
                {courseData.map((item) => {
                  const percentage =
                    totalStudents > 0
                      ? Math.round((item.count / totalStudents) * 100)
                      : 0;

                  return (
                    <div key={item.course} className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--clay-text)]">
                        <span className="truncate max-w-[70%]">{item.course}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[var(--clay-text-secondary)]">
                            {percentage}%
                          </span>
                          <span className="clay-badge-inset px-2.5 py-0.5 text-xs font-bold text-[var(--clay-primary)]">
                            {item.count} student{item.count === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {/* Claymorphic Bar Container */}
                      <div className="clay-badge-inset h-4 sm:h-5 rounded-full p-0.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(percentage, 5)}%`,
                            backgroundColor: 'var(--clay-primary)',
                            boxShadow: '2px 2px 5px rgba(217, 119, 87, 0.4)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Academic Year Distribution Panel */}
          <section className="clay-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--clay-border)]/60 pb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[var(--clay-accent)]" />
                <h3 className="text-lg md:text-xl font-bold text-[var(--clay-text)] m-0">
                  Cohort Distribution by Year
                </h3>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={`skel-yr-${n}`} className="clay-badge-inset h-20 rounded-2xl bg-[var(--clay-border)]" />
                ))}
              </div>
            ) : yearData.length === 0 ? (
              <div className="clay-badge-inset p-6 text-center rounded-2xl text-xs sm:text-sm text-[var(--clay-text-secondary)] font-medium">
                No academic cohort records recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {yearData.map((item) => (
                  <div
                    key={`year-${item.year}`}
                    className="clay-badge-inset p-4 rounded-2xl text-center flex flex-col justify-between"
                  >
                    <div className="text-xs font-bold text-[var(--clay-text-secondary)] uppercase">
                      Year {item.year}
                    </div>
                    <div className="text-2xl font-extrabold text-[var(--clay-primary)] my-1">
                      {item.count}
                    </div>
                    <div className="text-[11px] font-medium text-[var(--clay-text-secondary)]">
                      {totalStudents > 0
                        ? `${Math.round((item.count / totalStudents) * 100)}% of total`
                        : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recent Activity Panel (5 cols) */}
        <div className="lg:col-span-5">
          <section className="clay-card p-6 md:p-8 space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--clay-border)]/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-[var(--clay-success)]" />
                  <h3 className="text-lg md:text-xl font-bold text-[var(--clay-text)] m-0">
                    Recent Activity
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[var(--clay-text-secondary)]">
                  Live Audit Log
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={`skel-log-${n}`}
                      className="clay-badge-inset p-4 rounded-2xl h-16 animate-pulse bg-[var(--clay-border)]"
                    />
                  ))}
                </div>
              ) : activityLogs.length === 0 ? (
                /* Styled Claymorphic Empty State */
                <div className="clay-badge-inset p-8 text-center rounded-2xl space-y-3 my-6">
                  <History className="w-8 h-8 mx-auto text-[var(--clay-text-secondary)]" />
                  <h4 className="text-sm font-bold text-[var(--clay-text)] m-0">
                    No activity logs recorded yet
                  </h4>
                  <p className="text-xs text-[var(--clay-text-secondary)] font-medium">
                    Mutations (student creation, updates, and deletions) will appear here in real-time.
                  </p>
                </div>
              ) : (
                /* Activity Logs List */
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {activityLogs.map((log) => {
                    const badge = getActionBadge(log.action_type);

                    return (
                      <div
                        key={log.id}
                        className="clay-badge-inset p-3.5 rounded-2xl flex flex-col gap-1.5 transition-all hover:bg-[#F6E7D7]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[11px] font-medium text-[var(--clay-text-secondary)]">
                            {formatTimestamp(log.created_at)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-[var(--clay-text)] m-0 leading-snug">
                          {log.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--clay-border)]/50">
              <Link
                to="/"
                className="clay-btn w-full py-2.5 text-xs sm:text-sm font-semibold gap-2 text-[var(--clay-text)] hover:text-[var(--clay-primary)]"
              >
                <span>Go to Student Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
