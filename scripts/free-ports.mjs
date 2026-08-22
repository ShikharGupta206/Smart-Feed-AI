import { execSync } from 'node:child_process'

const ports = [5173, 8000]
for (const port of ports) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    const pids = [...new Set(output.split(/\r?\n/).map(line => line.trim().split(/\s+/).at(-1)).filter(pid => /^\d+$/.test(pid) && pid !== '0'))]
    for (const pid of pids) {
      try { execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' }) } catch {}
    }
  } catch {}
}
