import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  // State to store patient data
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '' });
  const [updatedPatient, setUpdatedPatient] = useState({ name: '', age: '' });
  const [editingPatientId, setEditingPatientId] = useState(null); // Track which patient is being edited

  // Fetch patients from the backend on initial load
  useEffect(() => {
    axios.get('http://localhost:5000/patients')
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => console.error("There was an error fetching the patients!", error));
  }, []);

  // Handle input change for new patient
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({ ...newPatient, [name]: value });
  };

  // Handle adding a new patient
  const handleAddPatient = () => {
    axios.post('http://localhost:5000/patients', newPatient)
      .then(response => {
        setPatients([...patients, response.data]); // Add new patient to the state
        setNewPatient({ name: '', age: '' }); // Clear input fields
      })
      .catch(error => console.error("There was an error adding the patient!", error));
  };

  // Handle updating patient data (show editable fields)
  const handleEditPatient = (patient) => {
    setEditingPatientId(patient._id); // Mark patient as being edited
    setUpdatedPatient({ name: patient.name, age: patient.age }); // Pre-fill input fields with patient data
  };

  // Handle updating patient on save
  const handleSaveUpdate = () => {
    if (editingPatientId) {
      axios.put(`http://localhost:5000/patients/${editingPatientId}`, updatedPatient)
        .then(response => {
          // Update the patient list with the updated patient data
          setPatients(patients.map(patient =>
            patient._id === editingPatientId ? response.data : patient
          ));
          setEditingPatientId(null); // Reset editing state
          setUpdatedPatient({ name: '', age: '' }); // Clear input fields
        })
        .catch(error => console.error("There was an error updating the patient!", error));
    }
  };

  // Handle deleting a patient
  const handleDeletePatient = (id) => {
    axios.delete(`http://localhost:5000/patients/${id}`)
      .then(response => {
        setPatients(patients.filter(patient => patient._id !== id)); // Remove patient from list
      })
      .catch(error => console.error("There was an error deleting the patient!", error));
  };

  return (
    <div>
      <h1>Patient Management</h1>

      {/* Form for adding new patient */}
      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newPatient.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={newPatient.age}
          onChange={handleInputChange}
        />
        <button onClick={handleAddPatient}>Add Patient</button>
      </div>

      {/* Table displaying patients */}
      <table border="1" cellPadding="10" cellSpacing="0" style={{ marginTop: "20px", width: "80%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient._id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>
                <button onClick={() => handleEditPatient(patient)}>Edit</button>
                <button onClick={() => handleDeletePatient(patient._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for updating patient data (only shown when editing) */}
      {editingPatientId && (
        <div>
          <h3>Edit Patient</h3>
          <input
            type="text"
            name="name"
            value={updatedPatient.name}
            onChange={(e) => setUpdatedPatient({ ...updatedPatient, name: e.target.value })}
          />
          <input
            type="number"
            name="age"
            value={updatedPatient.age}
            onChange={(e) => setUpdatedPatient({ ...updatedPatient, age: e.target.value })}
          />
          <button onClick={handleSaveUpdate}>Save Changes</button>
          <button onClick={() => setEditingPatientId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
