import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', formData);
      setProfile(response.data);
      setEditing(false);
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-lg text-gray-900">{profile.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {profile.role}
                </span>
              </p>
            </div>

            {profile.role === 'company' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Industry</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.industry || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Description</label>
                  <p className="mt-1 text-gray-900">{profile.companyDescription || 'Not specified'}</p>
                </div>
              </>
            )}

            {profile.role === 'developer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-gray-900">{profile.bio || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Skills</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.skills?.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Experience</label>
                  <p className="mt-1 text-gray-900">{profile.experience || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Portfolio Links</label>
                  <div className="mt-2 space-y-2">
                    {profile.portfolioLinks?.github && (
                      <p>GitHub: <a href={profile.portfolioLinks.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.portfolioLinks.github}</a></p>
                    )}
                    {profile.portfolioLinks?.figma && (
                      <p>Figma: <a href={profile.portfolioLinks.figma} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.portfolioLinks.figma}</a></p>
                    )}
                    {profile.portfolioLinks?.website && (
                      <p>Website: <a href={profile.portfolioLinks.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.portfolioLinks.website}</a></p>
                    )}
                    {!profile.portfolioLinks?.github && !profile.portfolioLinks?.figma && !profile.portfolioLinks?.website && (
                      <p className="text-gray-500">No portfolio links added</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {user.role === 'company' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Technology, Finance, Healthcare"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                  <textarea
                    rows="4"
                    className="input-field"
                    placeholder="Tell us about your company..."
                    value={formData.companyDescription || ''}
                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  />
                </div>
              </>
            )}

            {user.role === 'developer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows="4"
                    className="input-field"
                    placeholder="Tell us about yourself..."
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="React, Node.js, Python, etc."
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., 3 years"
                    value={formData.experience || ''}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Links</label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      className="input-field"
                      placeholder="GitHub URL"
                      value={formData.portfolioLinks?.github || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        portfolioLinks: { ...formData.portfolioLinks, github: e.target.value }
                      })}
                    />
                    <input
                      type="url"
                      className="input-field"
                      placeholder="Figma URL"
                      value={formData.portfolioLinks?.figma || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        portfolioLinks: { ...formData.portfolioLinks, figma: e.target.value }
                      })}
                    />
                    <input
                      type="url"
                      className="input-field"
                      placeholder="Website URL"
                      value={formData.portfolioLinks?.website || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        portfolioLinks: { ...formData.portfolioLinks, website: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(profile);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
