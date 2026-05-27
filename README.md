# JavaScript-Piano

## JavaScript Piano README
### Project Overview   

JavaScript Piano is a lightweight, responsive web piano that supports mouse, touch, and keyboard input. It includes recording with timestamped notes, tempo-adjustable playback, save/load to localStorage, JSON export/import, QR code sharing, and a dark/light theme toggle. Audio files expected in the project root: a.wav b.wav c.wav d.wav e.wav. Serve the project over HTTP when testing audio.  

### Features  
- Play via mouse, touch, and keyboard keys `a b c d e`.  

- Record melodies with timestamps.  

- Playback with adjustable tempo (50%–200%).  

- Save multiple recordings to localStorage.  

- Export and Import recordings as JSON files.  

- Share recordings via QR codes.  

- Dark / Light theme toggle.  

- Responsive layout for mobile, tablet, and desktop.  

### Quick Start  
bash
```
# Clone repository
git clone git@github.com:QMS85/JavaScript-Piano.git
cd JavaScript-Piano
```
```
# Serve files locally (audio requires HTTP)
# Option A Python`
python -m http.server 8000
```
```
# Option B Node
npx http-server . -p 8000
```
```
# Open in browser
# http://localhost:8000
```

### Required files  
Place `a.wav, b.wav, c.wav, d.wav, e.wav` in the project root. If audio files are large, consider using Git LFS.  

### Development Workflow  
Run these commands from the project root inside VS Code integrated terminal (Git Bash). The feature branch used here is JavaScript-Piano-Updates.  
bash
```
# Preflight checks  
git --version  
gh --version  
gh auth status  

# Ensure main is up to date  
git checkout main  
git pull origin main  

# Create or switch to feature branch  
git switch -c JavaScript-Piano-Updates  

# Stage changed files  
git add index.html styles.css script.js  

# If you added audio files  
git add *.wav  

# Review staged changes  
git status  
git diff --staged  

# Commit  
git commit -m "feat: responsive piano UI, recording, import/export, QR, tempo control"  

# Push branch to remote  
git push -u origin JavaScript-Piano-Updates  

# Create a Pull Request (non-interactive)  
gh pr create --base main --head JavaScript-Piano-Updates \  
  --title "feat: piano UI + recording + import/export + QR + tempo" \  
  --body "Adds responsive piano UI, recording/playback, save/load, export/import JSON, QR sharing, tempo control. Test locally via a static server (python -m http.server)."  

# Open PR in browser for review  
gh pr view --web  

# Merge PR when ready (squash and delete branch)  
gh pr merge --squash --delete-branch --subject "feat: piano updates" --body "Merge piano updates"  
```

### Optional Tag and Release  
bash  
```
git checkout main  
git pull origin main  
git tag -a v1.1.0 -m "v1.1.0: piano UI, recording, import/export, QR, tempo"  
git push origin v1.1.0  
gh release create v1.1.0 --title "v1.1.0" --notes "Add responsive piano UI, recording, import/export, QR sharing, tempo control"  
```  
### Optional Git LFS for audio  
bash  
```
# Install and enable LFS (one time)  
git lfs install  

# Track wav files  
git lfs track "*.wav"  

# Commit .gitattributes  
git add .gitattributes  
git commit -m "chore: track wav files with Git LFS"  

# Add audio files and push  
git add *.wav  
git commit -m "chore: add audio assets via LFS"  
git push  
```  

### Testing Checklist  
- Serve via HTTP: `python -m http.server 8000 or npx http-server . -p 8000.`  
- Open `http://localhost:8000`.  
- Verify keys play audio (a.wav..e.wav).  
- Record → Stop → Playback current recording.  
- Adjust tempo slider and confirm playback speed changes.  
- Save a recording and confirm it appears in Saved Recordings.   
- Export JSON and import it back.   
- Generate QR for a recording and scan from another device to import.  
- Toggle theme and verify styles.   
- Check DevTools console for errors.   

### Troubleshooting   
Audio not playing: Ensure files exist and you are serving over HTTP (browsers block audio on `file://`).  

gh authentication 401: Run `gh auth login --web` and follow prompts or create a PAT with scopes `repo, read:org, admin:public_key`. Use `echo "TOKEN" | gh auth login --with-token`.   

### Uncommitted changes block branch switch: Commit or stash changes:  
bash  
```
git add .
git commit -m "WIP: save changes"
# or
git stash push -m "WIP"
```  

PR creation errors: Ensure branch has commits and is pushed: `git push -u origin JavaScript-Piano-Updates`. If a PR already exists, view it with `gh pr view --web`.  

Large audio files: Use Git LFS to avoid repo bloat.  

### License  
MIT License — add a `LICENSE` file with the MIT text and update the copyright.  

### MIT License  

Copyright (c) 2026 Jonathan Peters  

Permission is hereby granted, free of charge, to any person obtaining a copy.  
...
