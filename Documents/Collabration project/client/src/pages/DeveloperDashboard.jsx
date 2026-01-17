import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const DeveloperDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, applicationsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/applications/my-applications')
      ]);
      setProjects(projectsRes.data);
      setApplications(applicationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      selected: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.applied;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="text-gray-600 mt-2">Browse projects and manage your applications</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Browse Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Applications ({applications.length})
          </button>
        </nav>
      </div>

      {activeTab === 'browse' && (
        <div>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No projects available at the moment</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">by {project.company?.name}</p>
                  <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {project.requiredSkills?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{project.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {project.deadline && (
                      <p className="text-sm text-gray-500">
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div>
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">You haven't applied to any projects yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/projects/${app.project._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {app.project.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Company: {app.project.company?.name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Proposal:</p>
                    <p className="text-sm text-gray-600">{app.proposal}</p>
                  </div>

                  {app.submissionLinks && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Submitted Links:</p>
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

                  <p className="text-xs text-gray-500 mt-4">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;
