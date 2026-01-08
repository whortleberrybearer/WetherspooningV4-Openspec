# Quick Reference: Local Development

## One-Time Setup
```bash
# Install all dependencies
npm install
cd functions && npm install
cd ../Wetherspooning && npm install
cd ..

# Configure environment
cp Wetherspooning/.env.example Wetherspooning/.env
# Edit Wetherspooning/.env - add Google Maps API key

# Build functions
npm run functions:build
```

## Daily Development

### Start Everything
```bash
# Terminal 1 (Root) - Emulators
npm run dev

# Terminal 2 (Wetherspooning) - Frontend  
cd Wetherspooning
npm run dev
```

Open: http://localhost:5173

### First Time / Fresh Start
```bash
# Terminal 1
npm run dev

# Terminal 2 - Seed test data
npm run seed

# Terminal 3
cd Wetherspooning
npm run dev
```

Test login: `test@example.com` / `password123`

## Working with Functions

### Making Function Changes
```bash
# Terminal 1 - Watch mode (auto-rebuild)
cd functions
npm run watch

# Terminal 2 - Emulators (restart after each change)
npm run dev

# Terminal 3 - Frontend
cd Wetherspooning
npm run dev
```

**Remember:** Restart emulators after function code changes!

## Useful URLs

- Frontend: http://localhost:5173
- Emulator UI: http://localhost:4000
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Functions: http://localhost:5001

## Common Commands

```bash
# Root directory
npm run dev              # Start emulators (with data persistence)
npm run emulator:clear   # Start fresh (no saved data)
npm run seed            # Seed test data
npm run functions:build # Build Cloud Functions

# Wetherspooning directory
npm run dev    # Start Vite dev server
npm run build  # Build for production
npm test       # Run tests

# Functions directory
npm run build  # Build TypeScript
npm run watch  # Build in watch mode
npm test       # Run tests
```

## Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# Or just restart your computer 😅
```

### Functions Not Loading
1. Rebuild: `npm run functions:build`
2. Restart emulators (Ctrl+C in Terminal 1, then `npm run dev`)
3. Check logs in Emulator UI: http://localhost:4000

### Need Fresh Data
```bash
# Stop emulators (Ctrl+C)
rm -rf .emulator-data  # Delete saved data
npm run dev            # Restart
npm run seed          # Reseed
```

### Can't Login
- Check emulators are running (http://localhost:4000)
- Use test credentials: `test@example.com` / `password123`
- Check browser console for errors
- Verify `.env` has `VITE_FIREBASE_PROJECT_ID=demo-wetherspooning`

## Tips

✅ **Do:**
- Keep emulators running in a dedicated terminal
- Use `npm run watch` in functions/ when editing Cloud Functions
- Check Emulator UI (http://localhost:4000) for debugging

❌ **Don't:**
- Stop emulators with Ctrl+C during data operations (data may not save)
- Edit code directly in `functions/lib/` (it gets overwritten)
- Commit `.emulator-data/` to git (it's local only)

## Files You'll Edit

**Frontend:**
- `Wetherspooning/src/` - Vue components, composables, services
- `Wetherspooning/.env` - Environment config (not committed)

**Backend:**
- `functions/src/` - TypeScript Cloud Functions
- `functions/.env` - Backend env vars (not committed)

**Config:**
- `firebase.json` - Emulator and hosting config
- Root `package.json` - Development scripts

## Need Help?

See [DEVELOPMENT.md](DEVELOPMENT.md) for complete documentation.
