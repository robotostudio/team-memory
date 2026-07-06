#!/usr/bin/env python3
"""Start (or reuse) a local static server for the ui-match output dir and print a clickable URL.

Idempotent: if a server is already up on the chosen port serving this dir, it's reused.
The server is detached (survives this script exiting) so the URL stays live across turns.

Usage:
    python3 serve.py [--outdir /tmp/ui-match] [--page <slug>] [--port 8787]
"""
import sys, os, socket, subprocess, time, urllib.request

def port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0

def http_ok(port, path="/"):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=1) as r:
            return r.status == 200
    except Exception:
        return False

def main():
    args = sys.argv[1:]
    def opt(flag, default):
        if flag in args:
            i = args.index(flag); v = args[i+1]; del args[i:i+2]; return v
        return default
    outdir = opt("--outdir", "/tmp/ui-match")
    page   = opt("--page", None)
    port   = int(opt("--port", "8787"))
    os.makedirs(outdir, exist_ok=True)

    # Reuse if our server already answers; else if the port is taken by something else, hop.
    if port_open(port):
        if not http_ok(port, "/index.html"):
            start = port
            while port_open(port) and port < start + 20:
                port += 1
    if not port_open(port):
        log = open(os.path.join(outdir, ".server.log"), "a")
        subprocess.Popen(
            [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", outdir],
            stdout=log, stderr=log, start_new_session=True)
        for _ in range(20):
            if http_ok(port, "/index.html") or port_open(port):
                break
            time.sleep(0.2)

    base = f"http://localhost:{port}"
    print(f"{base}/{page}.html" if page else f"{base}/index.html")

if __name__ == "__main__":
    main()
