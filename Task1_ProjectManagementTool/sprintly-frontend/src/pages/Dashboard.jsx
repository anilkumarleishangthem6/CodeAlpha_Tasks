
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const notificationRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchProjects();
    fetchNotifications();
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/projects', newProject);
      setProjects([...projects, data]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      console.error('failed to create project', err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/projects/${editProject._id}`, {
        name: editProject.name,
        description: editProject.description,
      });
      setProjects(projects.map((p) => (p._id === data._id ? data : p)));
      setShowEditModal(false);
      setEditProject(null);
    } catch (err) {
      console.error('failed to update project', err);
    }
  };
  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await API.delete(`/projects/${editProject._id}`);
      setProjects(projects.filter((p) => p._id !== editProject._id));
      setShowEditModal(false);
      setEditProject(null);
    } catch (err) {
      console.error('failed to delete project', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error('failed to fetch notifications', err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('failed to mark notifications as read', err);
    }
  };

  const handleAccept = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/accept`);
      setNotifications(notifications.map((n) =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      fetchProjects(); // refresh projects list
    } catch (err) {
      console.error('failed to accept invite', err);
    }
  };

  const handleDecline = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/decline`);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('failed to decline invite', err);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const colors = [
    'bg-indigo-500/20 text-indigo-400',
    'bg-purple-500/20 text-purple-400',
    'bg-teal-500/20 text-teal-400',
    'bg-pink-500/20 text-pink-400',
    'bg-amber-500/20 text-amber-400',
    'bg-blue-500/20 text-blue-400',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col fixed h-full">

        {/* logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#6366f1" />
              <path d="M8 16L12 10L16 14L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 20H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 18V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-white font-bold tracking-tight">Sprintly</span>
          </div>
        </div>

        {/* nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto hide-scrollbar">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
            Workspace
          </p>

          {/* projects list in sidebar */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition w-full text-left"
            >
              <span className="text-lg leading-none">+</span>
              New Project
            </button>

            {projects.map((project, index) => (
              <button
                key={project._id}
                onClick={() => navigate(`/board/${project._id}`)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition w-full text-left group"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${colors[index % colors.length]}`}>
                  {project.name[0].toUpperCase()}
                </div>
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* user section at bottom */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-400 transition text-xs "
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 ml-64">

        {/* top bar */}
        <div className="border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <div>
            <h1 className="text-lg font-semibold text-white">My Projects</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* search bar */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-48 focus-within:border-indigo-500/60 transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="bg-transparent text-white text-sm focus:outline-none w-full placeholder:text-gray-600"
              />
            </div>

            {/* bell icon */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center text-gray-400 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 bg-[#111111] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto hide-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-600 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`px-4 py-3 border-b border-white/5 transition ${!n.read ? 'bg-indigo-500/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {n.sender?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                              {n.type === 'invite' && !n.read && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleAccept(n._id)}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg transition"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleDecline(n._id)}
                                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1 rounded-lg transition"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <span>+</span> New Project
            </button>
          </div>
        </div>

        {/* projects grid */}
        <div className="px-8 py-8">
          {loading ? (
            <div className="text-gray-600 text-sm">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-32">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg font-medium text-gray-400">No projects yet</p>
              <p className="text-sm text-gray-600 mt-1 mb-6">
                Create your first project to get started
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                + Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).map((project, index) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/board/${project._id}`)}
                  className=" relative bg-white/[0.03] border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-white/10 hover:bg-white/[0.05] transition group"
                >
                  {/* project icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-4 ${colors[index % colors.length]}`}>
                    {project.name[0].toUpperCase()}
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditProject(project);
                        setShowEditModal(true);
                      }}
                      className="text-gray-500 hover:text-white transition text-xs px-2 py-1 rounded-lg hover:bg-white/10"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="font-medium text-white group-hover:text-indigo-300 transition truncate">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {project.description || 'No description'}
                  </p>

                  {/* members */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {project.members?.slice(0, 4).map((member, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium"
                        >
                          {getInitials(member.name)}
                        </div>
                      ))}
                      {project.members?.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#0a0a0a] flex items-center justify-center text-xs text-gray-400">
                          +{project.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {project.taskCount || 0} tasks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* create project modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-1">New Project</h3>
            <p className="text-gray-500 text-sm mb-5">Set up a new workspace for your team</p>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  placeholder="e.g. Website Redesign"
                  className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 transition placeholder:text-gray-600"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What's this project about?"
                  rows={3}
                  className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 transition placeholder:text-gray-600 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-1">Edit Project</h3>
            <p className="text-gray-500 text-sm mb-5">Update your project details</p>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  required
                  className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  placeholder="What's this project about?"
                  rows={3}
                  className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 transition placeholder:text-gray-600 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (editProject.owner !== user?._id && editProject.owner?._id !== user?._id) {
                      alert('Only the project owner can delete this project!');
                      return;
                    }
                    handleDeleteProject();
                  }}
                  className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditProject(null); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;