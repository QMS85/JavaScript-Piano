/* 
  script.js
  - Works with: index.html and styles.css above
  - Assumes audio files named a.wav, b.wav, c.wav, d.wav, e.wav are available in same folder
*/

/* ---------- DOM references ---------- */
const keys = document.querySelectorAll(".piano-keys .key");
const recordBtn = document.getElementById("record-btn");
const playbackBtn = document.getElementById("playback-btn");
const clearBtn = document.getElementById("clear-btn");
const saveBtn = document.getElementById("save-btn");
const exportBtn = document.getElementById("export-btn");
const qrBtn = document.getElementById("qr-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const recordingsList = document.getElementById("recordings-list");
const qrContainer = document.getElementById("qr-container");
const themeToggle = document.getElementById("theme-toggle");
const tempoSlider = document.getElementById("tempo");
const tempoValue = document.getElementById("tempo-value");

/* ---------- State ---------- */
let isRecording = false;
let recording = [];            // current unsaved recording: [{key:'a', time: 123}, ...]
let startTime = 0;
let tempo = 1.0;               // multiplier (1.0 = 100%)
const STORAGE_KEY = "pianoRecordings"; // localStorage key

/* ---------- Utility: play a note ---------- */
function playSound(key) {
  // Use short audio files named a.wav, b.wav, etc.
  try {
    const audio = new Audio(`${key}.wav`);
    audio.play().catch(() => { /* ignore play promise rejection on autoplay policies */ });
  } catch (err) {
    // If audio fails, silently continue (no hallucinations about missing files)
  }

  // Visual feedback
  const el = document.querySelector(`.key[data-key="${key}"]`);
  if (el) {
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 180);
  }

  // If recording, push timestamped event
  if (isRecording) {
    const time = Date.now() - startTime;
    recording.push({ key, time });
  }
}

/* ---------- Attach events to keys (click, touch, keyboard) ---------- */
keys.forEach(k => {
  k.addEventListener("click", () => playSound(k.dataset.key));
  k.addEventListener("touchstart", (e) => { e.preventDefault(); playSound(k.dataset.key); }, { passive: false });
  // keyboard accessibility: Enter/Space
  k.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      playSound(k.dataset.key);
    }
  });
});

// physical keyboard mapping
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (["a","b","c","d","e"].includes(key)) {
    // prevent repeated keydown spam by ignoring if key is held (optional)
    playSound(key);
  }
});

/* ---------- Theme toggle ---------- */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

/* ---------- Tempo control ---------- */
tempoSlider.addEventListener("input", () => {
  tempo = tempoSlider.value / 100;
  tempoValue.textContent = `${tempoSlider.value}%`;
});

/* ---------- Recording controls ---------- */
recordBtn.addEventListener("click", () => {
  if (!isRecording) {
    // start
    isRecording = true;
    recording = [];
    startTime = Date.now();
    recordBtn.textContent = "Stop Recording";
    playbackBtn.disabled = true;
    clearBtn.disabled = true;
    saveBtn.disabled = true;
    exportBtn.disabled = true;
    qrBtn.disabled = true;
  } else {
    // stop
    isRecording = false;
    recordBtn.textContent = "Start Recording";
    if (recording.length > 0) {
      playbackBtn.disabled = false;
      clearBtn.disabled = false;
      saveBtn.disabled = false;
      exportBtn.disabled = false;
      qrBtn.disabled = false;
    }
  }
});

/* ---------- Playback (current recording) ---------- */
function schedulePlayback(notes, tempoMultiplier = 1.0) {
  if (!Array.isArray(notes) || notes.length === 0) return;

  // disable playback button while playing
  playbackBtn.disabled = true;

  // schedule each note using setTimeout scaled by tempo
  notes.forEach(note => {
    const delay = Math.max(0, Math.round(note.time / tempoMultiplier));
    setTimeout(() => playSound(note.key), delay);
  });

  // re-enable after last note + small buffer
  const lastTime = notes[notes.length - 1].time;
  setTimeout(() => { playbackBtn.disabled = false; }, Math.round(lastTime / tempoMultiplier) + 600);
}

playbackBtn.addEventListener("click", () => {
  if (recording.length === 0) return;
  schedulePlayback(recording, tempo);
});

/* ---------- Clear current recording ---------- */
clearBtn.addEventListener("click", () => {
  recording = [];
  playbackBtn.disabled = true;
  clearBtn.disabled = true;
  saveBtn.disabled = true;
  exportBtn.disabled = true;
  qrBtn.disabled = true;
});

/* ---------- Save current recording to localStorage (with name) ---------- */
saveBtn.addEventListener("click", () => {
  if (!recording || recording.length === 0) return;
  const name = prompt("Name this recording (short, descriptive):");
  if (!name) return;

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  saved.push({ id: Date.now(), name: name.trim(), notes: recording });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  renderSavedRecordings();
  // keep current recording available for playback/export
});

/* ---------- Export current recording as JSON file ---------- */
exportBtn.addEventListener("click", () => {
  if (!recording || recording.length === 0) return;
  const filename = prompt("Filename for export (without extension):", "piano-recording") || "piano-recording";
  const blob = new Blob([JSON.stringify(recording, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

/* ---------- Generate QR code for current recording ---------- */
qrBtn.addEventListener("click", () => {
  if (!recording || recording.length === 0) return;
  qrContainer.innerHTML = ""; // clear previous
  try {
    const data = JSON.stringify(recording);
    // QRCode.toCanvas from included library
    QRCode.toCanvas(data, { width: 220 }, (err, canvas) => {
      if (err) {
        qrContainer.textContent = "Unable to generate QR code.";
        return;
      }
      const wrapper = document.createElement("div");
      wrapper.className = "qr-wrapper";
      const label = document.createElement("div");
      label.textContent = "Scan to import this melody";
      label.style.marginBottom = "8px";
      label.style.fontWeight = "700";
      wrapper.appendChild(label);
      wrapper.appendChild(canvas);
      qrContainer.appendChild(wrapper);
    });
  } catch (err) {
    qrContainer.textContent = "Error generating QR code.";
  }
});

/* ---------- Import JSON file (local) ---------- */
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  importFile.value = ""; // reset input so same file can be reselected later
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!Array.isArray(parsed)) {
        alert("Invalid file format: expected an array of notes.");
        return;
      }
      // set as current recording
      recording = parsed;
      playbackBtn.disabled = false;
      clearBtn.disabled = false;
      saveBtn.disabled = false;
      exportBtn.disabled = false;
      qrBtn.disabled = false;
      alert("Recording imported and ready to play.");
    } catch (err) {
      alert("Failed to read file. Make sure it's a valid JSON recording.");
    }
  };
  reader.readAsText(file);
});

/* ---------- Saved recordings list rendering & actions ---------- */
function renderSavedRecordings() {
  recordingsList.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  if (!saved.length) {
    const empty = document.createElement("div");
    empty.textContent = "No saved recordings yet.";
    empty.style.opacity = "0.8";
    recordingsList.appendChild(empty);
    return;
  }

  saved.forEach((rec, idx) => {
    const li = document.createElement("li");

    const meta = document.createElement("div");
    meta.className = "recording-meta";

    const nameEl = document.createElement("div");
    nameEl.className = "recording-name";
    nameEl.textContent = rec.name || `Recording ${idx+1}`;

    const lengthEl = document.createElement("div");
    lengthEl.style.opacity = "0.8";
    lengthEl.style.fontSize = "0.9rem";
    lengthEl.textContent = `${rec.notes.length} notes`;

    meta.appendChild(nameEl);
    meta.appendChild(lengthEl);

    const actions = document.createElement("div");
    actions.className = "recording-actions";

    // Play saved
    const playBtn = document.createElement("button");
    playBtn.textContent = "Play";
    playBtn.addEventListener("click", () => {
      schedulePlayback(rec.notes, tempo);
    });

    // Load into current recording (overwrite)
    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => {
      recording = JSON.parse(JSON.stringify(rec.notes)); // deep copy
      playbackBtn.disabled = false;
      clearBtn.disabled = false;
      saveBtn.disabled = false;
      exportBtn.disabled = false;
      qrBtn.disabled = false;
      alert(`Loaded "${rec.name}" into current recording.`);
    });

    // Export saved
    const exportSavedBtn = document.createElement("button");
    exportSavedBtn.textContent = "Export";
    exportSavedBtn.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(rec.notes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(rec.name || "piano-recording")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    // QR for saved
    const qrSavedBtn = document.createElement("button");
    qrSavedBtn.textContent = "QR";
    qrSavedBtn.addEventListener("click", () => {
      qrContainer.innerHTML = "";
      try {
        const data = JSON.stringify(rec.notes);
        QRCode.toCanvas(data, { width: 220 }, (err, canvas) => {
          if (err) {
            qrContainer.textContent = "Unable to generate QR code.";
            return;
          }
          const wrapper = document.createElement("div");
          wrapper.className = "qr-wrapper";
          const label = document.createElement("div");
          label.textContent = `Scan to import "${rec.name}"`;
          label.style.marginBottom = "8px";
          label.style.fontWeight = "700";
          wrapper.appendChild(label);
          wrapper.appendChild(canvas);
          qrContainer.appendChild(wrapper);
        });
      } catch {
        qrContainer.textContent = "Error generating QR code.";
      }
    });

    // Delete saved
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (!confirm(`Delete "${rec.name}" permanently?`)) return;
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      all.splice(idx, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      renderSavedRecordings();
    });

    actions.appendChild(playBtn);
    actions.appendChild(loadBtn);
    actions.appendChild(exportSavedBtn);
    actions.appendChild(qrSavedBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(meta);
    li.appendChild(actions);
    recordingsList.appendChild(li);
  });
}

/* ---------- Helpers ---------- */
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 120);
}

/* ---------- Initialize UI state ---------- */
(function init() {
  // tempo display
  tempo = tempoSlider.value / 100;
  tempoValue.textContent = `${tempoSlider.value}%`;

  // render saved recordings
  renderSavedRecordings();

  // If there is a saved recording list, enable import button (import always available)
  importBtn.disabled = false;

  // Ensure playback/clear/save/export/qr are disabled until a recording exists
  playbackBtn.disabled = true;
  clearBtn.disabled = true;
  saveBtn.disabled = true;
  exportBtn.disabled = true;
  qrBtn.disabled = true;
})();

