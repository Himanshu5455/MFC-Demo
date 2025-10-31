
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { patchCustomerNotes } from "../services/api";
import { COLORS } from "../components/color/Colors";

const buildNotesFromPatient = (patient) => {
  if (!patient?.answers?.note_title || !patient?.answers?.note || !patient?.answers?.note_time) return [];
  let titles = {};
  let descriptions = {};
  let time = {};

  try {
    titles = JSON.parse(patient.answers.note_title);
  } catch (e) {
    console.warn("Failed to parse note_title JSON", e);
  }
  try {
    descriptions = JSON.parse(patient.answers.note);
  } catch (e) {
    console.warn("Failed to parse note JSON", e);
  }
  try {
    time = JSON.parse(patient.answers.note_time);
  } catch (e) {
    console.warn("Failed to parse note JSON", e);
  }


  const keys = Object.keys(titles).sort();
  return keys.map((key) => ({
    id: key,
    title: titles[key] || "",
    description: descriptions[key] || "",
    time: time[key] || "",
    author: patient.answers?.note_author?.[key] || "Unknown",
  }));
};


const Notes = ({ patient, onSaveNote }) => {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [noteTime, setNoteTime] = useState("");

  useEffect(() => {
    const parsed = buildNotesFromPatient(patient);
    setNotes(parsed);
  }, [patient]);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteDescription.trim()) {
      alert("Please enter both a title and a description");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("new_note_title", noteTitle);
      formData.append("new_note", noteDescription);
      formData.append("note_time", noteTime);

      const response = await patchCustomerNotes(patient.id, formData);

      const newNote = {
        id: Date.now().toString(),
        title: noteTitle,
        description: noteDescription,
        author: "You",
        createdAt: new Date().toISOString(),
      };

      setNotes((prev) => [newNote, ...prev]);
      onSaveNote?.(newNote);
      setNoteTitle("");
      setNoteDescription("");

      console.log("Note saved – API response:", response);
    } catch (error) {
      console.error("Error saving note:", error);
      alert(
        error.response?.data?.detail || "Failed to save note."
      );
    }
  };

  const handleDelete = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (


    <div className="flex flex-col md:flex-row gap-6 w-full">
      <div className="flex flex-col items-end gap-2 w-full md:w-1/2">
        <input
          type="text"
          placeholder="Note title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />


        <textarea
          placeholder="Description"
          rows={4}
          value={noteDescription}
          onChange={(e) => setNoteDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />


        <button
          onClick={handleSaveNote}
          className="px-4 py-2 bg-gray-300 text-[#101010] rounded-xs transition-colors w-max"
        >
          + Save note
        </button>
      </div>


      <div className="flex flex-col gap-2 w-full md:w-2/2 relative">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm">No notes available.</p>
        ) : (
          notes.map((note, i) => (
            <div
              key={i}
              className="relative border-b border-gray-300 p-4 mb-2"
            >

              <h6 className="font-semibold text-gray-800">{note.title}</h6>

              <p className="text-gray-800 mb-1">{note.description}</p>
              <span className="text-gray-500 text-xs">
                {note.author}, {note.time}
              </span>


              <div className="absolute top-2 right-2 flex gap-1">

                <button className="text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </button>


                <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700">
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;