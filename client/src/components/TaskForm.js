import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './NewTask.css';
import CustomDropdown from './CustomDropdown';

function TaskForm({ onClose, refreshTasks, editMode, taskData }) {
  const [formData, setFormData] = useState({
    entityName: '',
    date: new Date(),
    time: new Date(),
    phoneNumber: '',
    contactPerson: '',
    note: '',
    taskType: 'Meeting',
    status: 'Open'
  });

  useEffect(() => {
    if (editMode && taskData) {
      setFormData({
        entityName: taskData.entityName,
        date: new Date(taskData.date),
        time: new Date(taskData.time),
        phoneNumber: taskData.phoneNumber,
        contactPerson: taskData.contactPerson,
        note: taskData.note,
        taskType: taskData.taskType,
        status: taskData.status
      });
    }
  }, [editMode, taskData]);

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const url = editMode ? `http://localhost:5000/api/tasks/${taskData._id}` : 'http://localhost:5000/api/tasks';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        alert(editMode ? 'Task updated successfully!' : 'Task saved successfully!');
        refreshTasks(); // Call the function to refresh tasks
        onClose();
      } else {
        throw new Error(editMode ? 'Failed to update task' : 'Failed to save task');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(editMode ? 'Error updating task' : 'Error saving task');
    }
  }

  const setStatus = (status) => {
    setFormData(prevState => ({
      ...prevState,
      status: status
    }));
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{editMode ? 'EDIT TASK' : 'NEW TASK'}</h2>
        <div className="status-buttons">
          <button
            className={`status-button ${formData.status === 'Open' ? 'active' : ''}`}
            onClick={() => setStatus('Open')}
          >
            Open
          </button>
          <button
            className={`status-button ${formData.status === 'Closed' ? 'active' : ''}`}
            onClick={() => setStatus('Closed')}
          >
            Closed
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            placeholder='Entity name'
            type="text"
            value={formData.entityName}
            onChange={e => handleChange('entityName', e.target.value)}
          />
        </div>
        <div className="form-group date-time-group">
          <div>
            <DatePicker
              placeholderText='Date'
              selected={formData.date}
              onChange={date => handleChange('date', date)}
              dateFormat="MMMM d, yyyy"
            />
          </div>
          <div>
            <DatePicker
              selected={formData.time}
              onChange={date => handleChange('time', date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={1}
              timeCaption="Time"
              dateFormat="h:mm aa"
            />
          </div>
        </div>
        <div className="form-group">
          <CustomDropdown
            value={formData.taskType}
            onChange={value => handleChange('taskType', value)}
          />
        </div>
        <div className="form-group">
          <input
            placeholder='Phone number'
            type="number"
            value={formData.phoneNumber}
            onChange={e => handleChange('phoneNumber', e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            placeholder='Contact Person'
            type="text"
            value={formData.contactPerson}
            onChange={e => handleChange('contactPerson', e.target.value)}
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder='Note (optional)'
            value={formData.note}
            onChange={e => handleChange('note', e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="save-button">{editMode ? 'Update' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
