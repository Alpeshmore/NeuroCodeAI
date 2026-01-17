import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [proposal, setProposal] = useState('');
  const [submissionLinks, setSubmissionLinks] = useState({
    github: '',
    figma: '',
    demo: '',
    other: ''
  });
  const [userApplication, setUserApplication] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);

      if (user.role === 'company') {
        const appsRes = await api.get(`/applications/project/${id}`);
        setApplications(appsRes.data);
      } else {
        const myAppsRes = await api.get('/applications/my-applications');
        const myApp = myAppsRes.data.find(app => app.project._id === id);
        setUserApplication(myApp);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/applications', { projectId: id, proposal });
      setShowApplyModal(false);
      setProposal('');
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/applications/${userApplication._id}/submit`, { submissionLinks });
      setShowSubmitModal(false);
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit');
    }
  };

  const handleShortlist = async (appId) => {
    try {
      await api.put(`/applications/${appId}/shortlist`);
      fetchProjectDetails();
    } catch (error) {
      alert('Failed to shortlist');
    }
  };

  const handleReject = async (appId) => {
    try {
      await api.put(`/applications/${appId}/reject`);
      fetchProjectDetails();
    } catch (error) {
      alert('Failed to reject');
    }
  };

  const handleSelectWinner = async (appId) => {
    if (window.confirm('Are you sure you want to select this developer as the winner?')) {
      try {
        await api.put(`/applications/${appId}/select`);
        fetchProjectDetails();
      } catch (error) {
        alert('Failed to select winner');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      selected: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:text-blue-800">
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-600">Posted by {project.company?.name}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            project.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {project.status}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{project.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack?.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {project.timeline && (
              <div>
                <h3 className="text-lg font-semibold mb-1">Timeline</h3>
                <p className="text-gray-700">{project.timeline}</p>
              </div>
            )}
            {project.deadline && (
              <div>
                <h3 className="text-lg font-semibold mb-1">Deadline</h3>
                <p className="text-gray-700">{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {user.role === 'developer' && !userApplication && project.status === 'open' && (
          <button
            onClick={() => setShowApplyModal(true)}
            className="mt-6 btn-primary"
          >
            Apply to Project
          </button>
        )}

        {userApplication && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Your Application Status:</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${getStatusColor(userApplication.status)}`}>
                  {userApplication.status}
                </span>
              </div>
              {userApplication.status === 'shortlisted' && !userApplication.submittedAt && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="btn-primary"
                >
                  Submit Solution
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {user.role === 'company' && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Applications ({applications.length})</h2>
          
          {applications.length === 0 ? (
            <p className="text-gray-500">No applications yet</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{app.developer.name}</h3>
                      <p className="text-sm text-gray-600">{app.developer.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {app.developer.skills && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {app.developer.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Proposal:</p>
                    <p className="text-sm text-gray-600">{app.proposal}</p>
                  </div>

                  {app.submissionLinks && (
                    <div className="mb-4 p-3 bg-green-50 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-2">Submitted Solution:</p>
                      <div className="space-y-1 text-sm">
                        {app.submissionLinks.github && (
                          <p>GitHub: <a href={app.submissionLinks.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{app.submissionLinks.github}</a></p>
                        )}
                        {app.submissionLinks.demo && (
                          <p>Demo: <a href={app.submissionLinks.demo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{app.submissionLinks.demo}</a></p>
                        )}
                      </div>
                    </div>
                  )}

                  {app.status === 'applied' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleShortlist(app._id)}
                        className="btn-primary text-sm"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {app.status === 'shortlisted' && app.submittedAt && (
                    <button
                      onClick={() => handleSelectWinner(app._id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Select as Winner
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Apply to Project</h2>
            <form onSubmit={handleApply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal *
                </label>
                <textarea
                  required
                  rows="6"
                  className="input-field"
                  placeholder="Explain why you're a good fit for this project..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Your Solution</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://github.com/..."
                    value={submissionLinks.github}
                    onChange={(e) => setSubmissionLinks({ ...submissionLinks, github: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Figma Link
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://figma.com/..."
                    value={submissionLinks.figma}
                    onChange={(e) => setSubmissionLinks({ ...submissionLinks, figma: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Live Demo
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={submissionLinks.demo}
                    onChange={(e) => setSubmissionLinks({ ...submissionLinks, demo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Link
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={submissionLinks.other}
                    onChange={(e) => setSubmissionLinks({ ...submissionLinks, other: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
