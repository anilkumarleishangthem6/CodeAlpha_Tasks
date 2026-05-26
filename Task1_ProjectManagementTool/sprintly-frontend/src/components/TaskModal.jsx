import { useState, useEffect } from 'react';
import API from '../services/api';

const TaskModal = ({ task, projectId, defaultStatus, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: defaultStatus || 'todo',
    dueDate: '',
    assignedTo: '',
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [members, setMembers] = useState([]);

  // eslint-disable-next-line
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo?._id || '',
      });
      fetchComments();
    }
    fetchMembers();
    // eslint-disable-next-line
  }, [task]);

  const fetchMembers = async () => {
    try {
      const { data } = await API.get(`/projects/${projectId}`);
      setMembers(data.members || []);
    } catch (err) {
      console.error('failed to fetch members', err);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/comments?task=${task._id}`);
      setComments(data);
    } catch (err) {
      console.error('failed to fetch comments', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task) {
        const { data } = await API.put(`/tasks/${task._id}`, formData);
        onSave(data, false);
      } else {
        const { data } = await API.post('/tasks', { ...formData, project: projectId });
        onSave(data, true);
      }
    } catch (err) {
      console.error('failed to save task', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${task._id}`);
      onDelete(task._id);
    } catch (err) {
      console.error('failed to delete task', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await API.post('/comments', {
        text: newComment,
        task: task._id,
      });
      setComments([...comments, data]);
      setNewComment('');
    } catch (err) {
      console.error('failed to add comment', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('failed to delete comment', err);
    }
     
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar">

        {/* modal header */}
        <div className="flex items-center justify-between px-6 py-4 -b border-gray-800">
          <h3 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* tabs — only show when editing existing task */}
        {task && (
          <div className="flex border-b border-gray-800 px-6">
            {['details', 'comments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm py-3 mr-6 capitalize border-b-2 transition ${activeTab === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
              >
                {tab}
                {tab === 'comments' && comments.length > 0 && (
                  <span className="ml-1.5 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-5">

          {/* details tab */}
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Task title"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add some details..."
                  rows={3}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* assign to — add here */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-sm text-gray-400 mb-1.5">Assign to</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                {task && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          )}

          {/* comments tab */}
          {activeTab === 'comments' && (
            <div>
              <div className="space-y-4 mb-5">
                {comments.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-6">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium shrink-0">
                        {comment.author?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {comment.author?.name}
                          </span>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-gray-600 hover:text-red-400 transition text-xs"
                          >
                            delete
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* add comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 rounded-lg transition"
                >
                  Send
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TaskModal;