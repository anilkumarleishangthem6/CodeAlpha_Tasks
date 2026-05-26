import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import socket from '../socket';
import TaskModal from '../components/TaskModal';
import Notifications from '../components/Notifications';

const columns = [
  { id: 'todo', label: 'To Do', color: 'text-gray-400' },
  { id: 'inprogress', label: 'In Progress', color: 'text-blue-400' },
  { id: 'review', label: 'Review', color: 'text-yellow-400' },
  { id: 'done', label: 'Done', color: 'text-green-400' },
];

const priorityConfig = {
  low: { label: 'Low', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Medium', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  high: { label: 'High', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const Board = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskCol, setNewTaskCol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line
  }, [id]);

  const fetchBoard = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?project=${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('failed to load board', err);
    } finally {
      setLoading(false);
    }
  };

  // socket connection for real-time updates
  useEffect(() => {
    socket.connect();
    socket.emit('join_project', id);

    socket.on('task_created', (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on('task_updated', (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });

    socket.on('task_deleted', (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    return () => {
      socket.emit('leave_project', id);
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [id]);

  // filter tasks by column status
  const getTasksByStatus = (status) => {
    return tasks.filter((t) => t.status === status);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggableId ? { ...t, status: destination.droppableId } : t
      )
    );
    const movedTask = tasks.find((t) => t._id === draggableId);

    try {
      await API.put(`/tasks/${draggableId}`, { status: destination.droppableId });
      const updatedTask = tasks.find((t) => t._id === draggableId);
      if (updatedTask) {
        socket.emit('task_updated', {
          projectId: id,
          task: { ...updatedTask, status: destination.droppableId }
        });
      }
      socket.emit('send_notification', {
        projectId: id,
        message: `${user?.name} moved "${movedTask?.title}" to ${destination.droppableId}`,
        type: 'task_moved',
      });
    } catch (err) {
      console.error('failed to update task status', err);
      fetchBoard();
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleAddTask = (colId) => {
    setSelectedTask(null);
    setNewTaskCol(colId);
    setShowTaskModal(true);
  };

  const handleTaskSaved = (task, isNew) => {
    if (isNew) {
      setTasks((prev) => [...prev, task]);
      socket.emit('task_created', { projectId: id, task });
      socket.emit('send_notification', {
        projectId: id,
        message: `${user?.name} added "${task.title}" to ${task.status}`,
        type: 'task_created',
      });
    } else {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      socket.emit('task_updated', { projectId: id, task });
      socket.emit('send_notification', {
        projectId: id,
        message: `${user?.name} updated task "${task.title}"`,
        type: 'task_updated',
      });
    }
    setShowTaskModal(false);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    socket.emit('task_deleted', { projectId: id, taskId });
    setShowTaskModal(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    try {
      await API.post(`/projects/${id}/invite`, { email: inviteEmail });
      setInviteSuccess('Member invited successfully!');
      setInviteEmail('');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 1500);
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-600 text-sm">
        Loading board...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

      {/* top navbar */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-4 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#6366f1" />
            <path d="M8 16L12 10L16 14L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 20H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M19 18V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="font-semibold text-white">{project?.name}</span>
          {project?.description && (
            <span className="text-gray-600 text-sm hidden md:block">— {project.description}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-600">{tasks.length} tasks</span>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-lg transition"
          >
            + Invite
          </button>
        </div>
      </div>

      {/* board */}
      <div className="flex-1 overflow-x-auto px-6 py-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 min-w-max">
            {columns.map((col) => (
              <div key={col.id} className="w-72 flex flex-col">

                {/* column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                      {getTasksByStatus(col.id).length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddTask(col.id)}
                    className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>

                {/* droppable area */}
                <Droppable droppableId={col.id} isDropDisabled={false}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-20 rounded-xl p-2 transition-colors ${snapshot.isDraggingOver
                        ? 'bg-white/[0.04]'
                        : 'bg-white/[0.02]'
                        }`}
                    >
                      {getTasksByStatus(col.id).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleTaskClick(task)}
                              className={`bg-[#111111] border rounded-xl p-4 mb-2 cursor-pointer transition ${snapshot.isDragging
                                ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 rotate-1'
                                : 'border-white/5 hover:border-white/10'
                                }`}
                            >
                              {/* priority strip + due date */}
                              {task.priority && (
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityConfig[task.priority]?.class}`}>
                                    {priorityConfig[task.priority]?.label}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-600">
                                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              )}

                              <p className="text-sm font-medium text-white leading-snug">
                                {task.title}
                              </p>

                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* footer */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                  </svg>
                                  <span className="text-xs">{task.commentCount || 0}</span>
                                </div>
                                {task.assignedTo && (
                                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium">
                                    {getInitials(task.assignedTo?.name)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* add task button at bottom of column */}
                      <button
                        onClick={() => handleAddTask(col.id)}
                        className="w-full py-2 rounded-lg text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition mt-1"
                      >
                        + Add task
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* task modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projectId={id}
          defaultStatus={newTaskCol}
          onSave={handleTaskSaved}
          onDelete={handleTaskDeleted}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-1">Invite Member</h3>
            <p className="text-gray-500 text-sm mb-5">
              Invite someone to collaborate on this project
            </p>

            {inviteError && (
              <div className="mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="mb-4 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
                {inviteSuccess}
              </div>
            )}

            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="teammate@example.com"
                  className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-indigo-500/60 transition placeholder:text-gray-600"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteError('');
                    setInviteSuccess('');
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Notifications />
    </div>
  );
};

export default Board;