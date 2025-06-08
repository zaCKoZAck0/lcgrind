import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProblemNote {
  id: string;
  problemId: string;
  title: string;
  content: string; // Markdown content
  createdAt: number;
  updatedAt: number;
  color?: string; // For sticky note colors
}

interface ProblemNotesState {
  notes: Record<string, ProblemNote>; // noteId -> note
  problemNotes: Record<string, string[]>; // problemId -> noteIds[]
}

const initialState: ProblemNotesState = {
  notes: {},
  problemNotes: {}
};

export interface CreateNotePayload {
  problemId: string;
  title: string;
  content: string;
  color?: string;
}

export interface UpdateNotePayload {
  noteId: string;
  title?: string;
  content?: string;
  color?: string;
}

export const problemNotesSlice = createSlice({
  name: 'problemNotes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<CreateNotePayload>) => {
      const { problemId, title, content, color } = action.payload;
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();
      
      const note: ProblemNote = {
        id: noteId,
        problemId,
        title,
        content,
        createdAt: now,
        updatedAt: now,
        color: color || '#fef3c7' // Default yellow color
      };
      
      state.notes[noteId] = note;
      
      if (!state.problemNotes[problemId]) {
        state.problemNotes[problemId] = [];
      }
      state.problemNotes[problemId].push(noteId);
    },
    
    updateNote: (state, action: PayloadAction<UpdateNotePayload>) => {
      const { noteId, title, content, color } = action.payload;
      const note = state.notes[noteId];
      
      if (note) {
        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        if (color !== undefined) note.color = color;
        note.updatedAt = Date.now();
      }
    },
    
    deleteNote: (state, action: PayloadAction<string>) => {
      const noteId = action.payload;
      const note = state.notes[noteId];
      
      if (note) {
        const problemId = note.problemId;
        delete state.notes[noteId];
        
        // Remove note ID from problem's note list
        if (state.problemNotes[problemId]) {
          state.problemNotes[problemId] = state.problemNotes[problemId].filter(
            id => id !== noteId
          );
          
          // Clean up empty arrays
          if (state.problemNotes[problemId].length === 0) {
            delete state.problemNotes[problemId];
          }
        }
      }
    },
    
    deleteAllNotesForProblem: (state, action: PayloadAction<string>) => {
      const problemId = action.payload;
      const noteIds = state.problemNotes[problemId] || [];
      
      // Delete all notes for this problem
      noteIds.forEach(noteId => {
        delete state.notes[noteId];
      });
      
      // Remove problem from problemNotes
      delete state.problemNotes[problemId];
    },
    
    resetAllNotes: (state) => {
      state.notes = {};
      state.problemNotes = {};
    }
  }
});

export const { 
  addNote, 
  updateNote, 
  deleteNote, 
  deleteAllNotesForProblem, 
  resetAllNotes 
} = problemNotesSlice.actions;

export default problemNotesSlice.reducer;
