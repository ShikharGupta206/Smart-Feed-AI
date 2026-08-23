import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('🚀 Starting SmartFeed AI MERN Stack...')

// Start Backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true
})

// Start Frontend
const frontend = spawn('npm', ['run', 'dev', '--', '--host'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true
})

const cleanup = () => {
  backend.kill()
  frontend.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('exit', cleanup)
