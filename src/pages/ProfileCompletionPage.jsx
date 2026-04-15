import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, doc, updateDoc } from '../firebase';
import './ProfileCompletionPage.css';

const VOLUNTEER_SKILLS = [
  'Teaching',
  'Healthcare',
  'Technology',
  'Finance',
  'Marketing',
  'Event Management',
  'Social Work',
  'Environmental',
  'Sports',
  'Arts & Culture',
  'Construction',
  'Agriculture',
  'Other'
];

export default function ProfileCompletionPage({ onComplete }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const isNgo = user?.role === 'ngo';

  const [formData, setFormData] = useState({
    // Common
    email: user?.email || '',
    phoneNumber: '',
    city: '',
    // Volunteer only
    fullName: user?.name || '',
    dateOfBirth: '',
    bio: '',
    skills: [],
    // NGO only
    organizationName: '',
    missionStatement: '',
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG and PNG files are allowed');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Store photo as base64 in Firestore (avoids Storage CORS issues)
      let photoUrl = null;
      if (photoPreview) {
        photoUrl = photoPreview; // base64 string from FileReader
      }

      const updateData = {
        profileCompleted: true,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        ...(photoUrl && { photoUrl }),
      };

      if (isNgo) {
        updateData.organizationName = formData.organizationName;
        updateData.missionStatement = formData.missionStatement;
      } else {
        updateData.fullName = formData.fullName;
        updateData.dateOfBirth = formData.dateOfBirth;
        updateData.bio = formData.bio;
        updateData.skills = formData.skills;
      }

      console.log('[ProfileCompletion] Saving profile...');
      await updateDoc(doc(db, 'users', user.uid), updateData);
      console.log('[ProfileCompletion] Done! Navigating...');
      onComplete?.();
    } catch (err) {
      console.error('[ProfileCompletion] Error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-completion-container">
      <div className="profile-completion-card">
        <h1>{isNgo ? 'Complete Organization Profile' : 'Complete Your Profile'}</h1>
        <p className="subtitle">
          {isNgo ? 'Tell us about your organization' : 'Help us know you better'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="form-group photo-upload">
            <label>
              {isNgo ? '🏢 Organization Logo' : '📷 Profile Photo'}
              <span className="required">*</span>
            </label>
            <div className="photo-upload-area">
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={() => document.getElementById('photoInput').click()}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  className="photo-placeholder"
                  onClick={() => document.getElementById('photoInput').click()}
                >
                  <div className="upload-icon">📷</div>
                  <p>Upload Photo</p>
                  <span className="file-info">JPG, PNG · max 5MB</span>
                </div>
              )}
              <input
                id="photoInput"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* NGO Fields */}
          {isNgo ? (
            <>
              <div className="form-group">
                <label>
                  🏛️ Organization Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  ✉️ Email Address
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="organization@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  📱 Phone Number
                  <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  📍 City
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  📝 Mission Statement
                  <span className="required">*</span>
                </label>
                <textarea
                  name="missionStatement"
                  value={formData.missionStatement}
                  onChange={handleInputChange}
                  placeholder="Describe your organization's mission"
                  rows="4"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Volunteer Fields */}
              <div className="form-group">
                <label>
                  Full Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  ✉️ Email Address
                  <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  📱 Phone Number
                  <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Date of Birth
                  <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  📍 City
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Bio
                  <span className="required">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Skills
                  <span className="required">*</span>
                </label>
                <p className="skills-hint">Select at least one skill</p>
                <div className="skills-grid">
                  {VOLUNTEER_SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`skill-tag ${formData.skills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {formData.skills.length === 0 && (
                  <span className="error-text">Please select at least one skill</span>
                )}
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading || (!isNgo && formData.skills.length === 0)}>
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
