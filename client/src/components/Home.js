
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import TaskForm from './TaskForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faCirclePlus, faSort } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

Modal.setAppElement('#root'); // Ensure to set the app element for accessibility

function Home() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [noteModalIsOpen, setNoteModalIsOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [note, setNote] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const openModal = (edit = false, task = null) => {
    setEditMode(edit);
    setTaskToEdit(task);
    setModalIsOpen(true);
  }

  const closeModal = () => {
    setModalIsOpen(false);
    setTaskToEdit(null);
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/list');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setFilterDropdownOpen(false);
  }

  const toggleFilterDropdown = () => {
    setFilterDropdownOpen(!filterDropdownOpen);
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const toggleStatus = async (taskId) => {
    try {
      const updatedTasks = tasks.map(task => {
        if (task._id === taskId) {
          return {
            ...task,
            status: task.status === 'Open' ? 'Closed' : 'Open'
          };
        }
        return task;
      });

      setTasks(updatedTasks);

      await fetch(`http://localhost:5000/api/task/status/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: updatedTasks.find(task => task._id === taskId).status }),
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  const openNoteModal = (taskId) => {
    setCurrentTaskId(taskId);
    setNoteModalIsOpen(true);
  }

  const closeNoteModal = () => {
    setNoteModalIsOpen(false);
    setCurrentTaskId(null);
    setNote('');
  }

  const handleNoteChange = (event) => {
    setNote(event.target.value);
  }

  const addNote = async () => {
    try {
      const updatedTasks = tasks.map(task => {
        if (task._id === currentTaskId) {
          return {
            ...task,
            note: note
          };
        }
        return task;
      });

      setTasks(updatedTasks);

      await fetch(`http://localhost:5000/api/task/${currentTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      closeNoteModal();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  const duplicateTask = async (taskId) => {
    try {
      const taskToDuplicate = tasks.find(task => task._id === taskId);
      if (!taskToDuplicate) return;

      const duplicatedTask = { ...taskToDuplicate, _id: undefined };

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedTask),
      });

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error duplicating task:', error);
    }
  }

  const sortTasks = (column) => {
    const order = sortOrder === 'asc' ? 'desc' : 'asc';
    const sortedTasks = [...tasks].sort((a, b) => {
      if (column === 'date') {
        return order === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      } else if (column === 'entityName') {
        return order === 'asc' ? a.entityName.localeCompare(b.entityName) : b.entityName.localeCompare(a.entityName);
      }
      return 0;
    });

    setTasks(sortedTasks);
    setSortColumn(column);
    setSortOrder(order);
  }

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(task => task.taskType === filter);

  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const date = formatDate(task.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});

  return (
    <div className="home-container">
      <button className="add-task-button" onClick={() => openModal(false)}>
        <FontAwesomeIcon icon={faCirclePlus} style={{ marginRight: '5px' }} />
        New Task
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Task Form"
        className="modal"
        overlayClassName="overlay"
      >
        <TaskForm onClose={closeModal} refreshTasks={fetchTasks} editMode={editMode} taskData={taskToEdit} />
      </Modal>

      <div>
        <h1>Sales Log</h1>
        <table>
          <thead>
            <tr>
              <th>
                Date 
                <FontAwesomeIcon icon={faSort} onClick={() => sortTasks('date')} className="sort-icon"/>
              </th>
              <th>
                Entity Name
                <FontAwesomeIcon icon={faSort} onClick={() => sortTasks('entityName')} className="sort-icon"/>
              </th>
              <th>
                <div className="filter-header">
                  Task Type
                  <FontAwesomeIcon className="filter" icon={faFilter} onClick={toggleFilterDropdown} />
                  {filterDropdownOpen && (
                    <select id="taskTypeFilter" value={filter} onChange={handleFilterChange}>
                      <option value="All">All</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Call">Call</option>
                      <option value="Video Call">Video Call</option>
                    </select>
                  )}
                </div>
              </th>
              <th>Time</th>
              <th>Contact Person</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedTasks).map(date => (
              <React.Fragment key={date}>
                <tr>
                  <td colSpan="8">
                    <p className='date'>{date}</p>
                    <hr />
                  </td>
                </tr>
                {groupedTasks[date].map(task => {
                  const time = new Date(task.time);
                  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                  return (
                    <tr key={task._id}>
                      <td>{formatDate(task.date)}</td>
                      <td className="entityName">{task.entityName}</td>
                      <td className="default">{task.taskType}</td>
                      <td className="default">{timeString}</td>
                      <td className="default">{task.contactPerson}</td>
                      <td className="default">
                        {task.note ? task.note : <button className="addnote-button" onClick={() => openNoteModal(task._id)}><FontAwesomeIcon icon={faCirclePlus} style={{ marginRight: '5px' }} />Add Note</button>}
                      </td>
                      <td className="default">{task.status}</td>
                      <td className="default">
                        <div className="task-table-buttons">
                          <button className="edit-button" onClick={() => openModal(true, task)}>Edit</button>
                          <button className="duplicate-button" onClick={() => duplicateTask(task._id)}>Duplicate</button>
                          <button className="status-button" onClick={() => toggleStatus(task._id)}>
                            {task.status === 'Open' ? 'Close' : 'Open'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={noteModalIsOpen}
        onRequestClose={closeNoteModal}
        contentLabel="Add Note"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className='mb-4'>Add Note</h2>
        <div className='d-flex flex-column align-items-start w-100'>
          <div className='input-group flex-grow-1 mb-2 w-100'>
            <textarea
              value={note}
              onChange={handleNoteChange}
              className='form-control mb-2 custom-textarea'
              rows="6"
              cols="60"
            />
          </div>
          <div className='d-flex justify-content-start w-100'>
            <button
              onClick={addNote}
              className='custom-save-button btn-sm me-3'
            >
              Save
            </button>
            <button
              onClick={closeNoteModal}
              className='custom-cancel-button btn-sm'
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Home;
