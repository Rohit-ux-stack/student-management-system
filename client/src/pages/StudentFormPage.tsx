import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, ShieldCheck } from 'lucide-react';
import { getStudentById, createStudent, updateStudent, ApiError } from '../api/students';
import { FormField } from '../components/FormField';
import { PhotoUpload } from '../components/PhotoUpload';
import { useToast } from '../context/ToastContext';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-Binary', label: 'Non-Binary' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer Not to Say', label: 'Prefer Not to Say' },
];

const COURSE_OPTIONS = [
  { value: '', label: 'Select course of study' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Mathematics & Physics', label: 'Mathematics & Physics' },
];

const YEAR_OPTIONS = [
  { value: '', label: 'Select academic year' },
  { value: 1, label: 'Year 1 (Freshman)' },
  { value: 2, label: 'Year 2 (Sophomore)' },
  { value: 3, label: 'Year 3 (Junior)' },
  { value: 4, label: 'Year 4 (Senior)' },
  { value: 5, label: 'Year 5 (Graduate/Extended)' },
  { value: 6, label: 'Year 6 (Postgraduate)' },
  { value: 7, label: 'Year 7 (Doctoral)' },
  { value: 8, label: 'Year 8 (Postdoctoral/Fellow)' },
];

export const StudentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const toast = useToast();

  // Form Field States
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState<number | string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [admissionNumber, setAdmissionNumber] = useState<string | null>(null);

  // Page States
  const [isLoadingInitial, setIsLoadingInitial] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Max DOB is today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // If edit mode, load student details
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoadingInitial(true);

    getStudentById(id)
      .then((res) => {
        if (!isMounted) return;
        const s = res.data;
        setName(s.name || '');
        setCourse(s.course || '');
        setYear(s.year || '');
        // Format YYYY-MM-DD if timestamp
        setDateOfBirth(s.date_of_birth ? s.date_of_birth.substring(0, 10) : '');
        setEmail(s.email || '');
        setMobileNumber(s.mobile_number || '');
        setGender(s.gender || '');
        setAddress(s.address || '');
        setExistingPhotoUrl(s.photo_url || null);
        setAdmissionNumber(s.admission_number || null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load student details';
        toast.error(msg);
      })
      .finally(() => {
        if (isMounted) setIsLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, toast]);

  // Frontend validation
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    } else if (name.trim().length > 255) {
      errs.name = 'Name cannot exceed 255 characters.';
    }

    if (!course.trim()) {
      errs.course = 'Please select or enter a course.';
    }

    const numYear = Number(year);
    if (!year || isNaN(numYear) || numYear < 1 || numYear > 8) {
      errs.year = 'Year of study must be between 1 and 8.';
    }

    if (!dateOfBirth) {
      errs.date_of_birth = 'Date of birth is required.';
    } else if (dateOfBirth > todayStr) {
      errs.date_of_birth = 'Date of birth cannot be in the future.';
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!mobileNumber.trim()) {
      errs.mobile_number = 'Mobile number is required.';
    } else if (!phoneRegex.test(mobileNumber.trim())) {
      errs.mobile_number = 'Please enter a valid phone number (7-20 digits).';
    }

    if (!gender) {
      errs.gender = 'Please select a gender.';
    }

    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error('Please fix the highlighted validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('course', course.trim());
      formData.append('year', String(year));
      formData.append('date_of_birth', dateOfBirth.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('mobile_number', mobileNumber.trim());
      formData.append('gender', gender.trim());
      if (address.trim()) {
        formData.append('address', address.trim());
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      let savedStudent;
      if (isEdit && id) {
        const res = await updateStudent(id, formData);
        savedStudent = res.data;
        toast.success('Student record updated successfully.');
      } else {
        const res = await createStudent(formData);
        savedStudent = res.data;
        toast.success('Student enrolled successfully.');
      }

      // Briefly pause to show success feedback then route to detail view
      setTimeout(() => {
        navigate(`/students/${savedStudent.id}`);
      }, 500);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setErrors(err.fieldErrors);
        }
        toast.error(err.message || 'Operation failed. Please check the fields below.');
      } else {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="clay-card p-12 text-center max-w-xl mx-auto my-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--clay-primary)] mb-4" />
        <p className="text-sm font-bold text-[var(--clay-text)]">
          Loading student record...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={isEdit && id ? `/students/${id}` : '/'}
          className="clay-btn px-4 py-2 text-sm font-semibold gap-2 text-[var(--clay-text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEdit ? 'Back to student profile' : 'Back to directory'}</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="clay-card p-6 md:p-10 space-y-8" noValidate>
        {/* Form Header */}
        <div className="border-b border-[var(--clay-border)]/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--clay-text)] tracking-tight m-0">
              {isEdit ? 'Edit student profile' : 'Enroll new student'}
            </h2>
            <p className="text-sm text-[var(--clay-text-secondary)] font-medium mt-1 mb-0">
              {isEdit
                ? 'Update academic information, contact details, and student photo'
                : 'Fill out the mandatory details to register a new student'}
            </p>
          </div>

          {/* Admission Number Read-Only Indicator (on Edit view) */}
          {isEdit && admissionNumber && (
            <div className="clay-badge-inset px-4 py-2 flex items-center gap-2 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-[var(--clay-primary)]" />
              <div>
                <div className="text-[10px] font-bold text-[var(--clay-text-secondary)] uppercase tracking-wider">
                  Admission ID
                </div>
                <div className="text-sm font-bold text-[var(--clay-text)]">
                  {admissionNumber}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 1: Photo Upload */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--clay-text)] flex items-center gap-2">
            <span>Profile photo</span>
          </h3>
          <PhotoUpload
            currentPhotoUrl={existingPhotoUrl}
            studentName={name}
            onFileSelect={(file) => setPhotoFile(file)}
            error={errors.photo}
          />
        </section>

        {/* Section 2: Personal Information */}
        <section className="space-y-5 pt-4 border-t border-[var(--clay-border)]/60">
          <h3 className="text-lg font-bold text-[var(--clay-text)]">
            Personal details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              id="name"
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Enter full name"
              required
              error={errors.name}
            />

            <FormField
              id="gender"
              label="Gender"
              type="select"
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }));
              }}
              options={GENDER_OPTIONS}
              required
              error={errors.gender}
            />

            <FormField
              id="date_of_birth"
              label="Date of birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                if (errors.date_of_birth) setErrors((prev) => ({ ...prev, date_of_birth: '' }));
              }}
              max={todayStr}
              required
              error={errors.date_of_birth}
              helperText="Cannot be a future date"
            />
          </div>
        </section>

        {/* Section 3: Academic Information */}
        <section className="space-y-5 pt-4 border-t border-[var(--clay-border)]/60">
          <h3 className="text-lg font-bold text-[var(--clay-text)]">
            Academic enrollment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              id="course"
              label="Course of study"
              type="select"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                if (errors.course) setErrors((prev) => ({ ...prev, course: '' }));
              }}
              options={COURSE_OPTIONS}
              required
              error={errors.course}
            />

            <FormField
              id="year"
              label="Academic year"
              type="select"
              value={year}
              onChange={(e) => {
                setYear(e.target.value ? Number(e.target.value) : '');
                if (errors.year) setErrors((prev) => ({ ...prev, year: '' }));
              }}
              options={YEAR_OPTIONS}
              required
              error={errors.year}
            />
          </div>
        </section>

        {/* Section 4: Contact Information */}
        <section className="space-y-5 pt-4 border-t border-[var(--clay-border)]/60">
          <h3 className="text-lg font-bold text-[var(--clay-text)]">
            Contact & address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="name@university.edu"
              required
              error={errors.email}
              helperText="Must be unique across all students"
            />

            <FormField
              id="mobile_number"
              label="Mobile phone number"
              type="tel"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                if (errors.mobile_number) setErrors((prev) => ({ ...prev, mobile_number: '' }));
              }}
              placeholder="+1 (555) 000-0000"
              required
              error={errors.mobile_number}
            />

            <div className="md:col-span-2">
              <FormField
                id="address"
                label="Residential address"
                type="textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter residential address"
                rows={3}
                error={errors.address}
              />
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-[var(--clay-border)]/60 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to={isEdit && id ? `/students/${id}` : '/'}
            className="clay-btn w-full sm:w-auto px-6 py-3 text-sm font-semibold text-[var(--clay-text)]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="clay-btn-primary w-full sm:w-auto px-8 py-3 text-sm font-semibold gap-2"
            id="student-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEdit ? 'Saving changes...' : 'Creating student...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Save student changes' : 'Enroll student'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentFormPage;
