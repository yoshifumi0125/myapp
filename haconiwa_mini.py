#!/usr/bin/env python3
"""
Haconiwa Mini - A simplified version of haconiwa CLI with start/stop functionality
"""

import argparse
import subprocess
import sys
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class HaconiwaMini:
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path.cwd() / "haconiwa-workspaces"
        self.config_dir = self.base_path / ".haconiwa"
        self.config_file = self.config_dir / "sessions.json"
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure necessary directories exist"""
        self.base_path.mkdir(exist_ok=True)
        self.config_dir.mkdir(exist_ok=True)
        if not self.config_file.exists():
            self._save_sessions({})
    
    def _load_sessions(self) -> Dict:
        """Load session information from config file"""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except:
            return {}
    
    def _save_sessions(self, sessions: Dict):
        """Save session information to config file"""
        with open(self.config_file, 'w') as f:
            json.dump(sessions, f, indent=2)
    
    def _run_command(self, cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Run a shell command"""
        try:
            return subprocess.run(cmd, capture_output=True, text=True, check=check)
        except subprocess.CalledProcessError as e:
            if check:
                print(f"Error: Command failed: {' '.join(cmd)}")
                print(f"Error output: {e.stderr}")
                sys.exit(1)
            return e
    
    def _tmux_session_exists(self, session_name: str) -> bool:
        """Check if tmux session exists"""
        result = self._run_command(["tmux", "has-session", "-t", session_name], check=False)
        return result.returncode == 0
    
    def start(self, company_name: str, config: Dict = None):
        """Start a new haconiwa environment (company)"""
        sessions = self._load_sessions()
        
        if company_name in sessions and self._tmux_session_exists(company_name):
            print(f"✗ Company '{company_name}' is already running")
            return False
        
        # Default configuration
        if config is None:
            config = {
                "orgs": [
                    {"name": "Frontend", "task": "UI Development"},
                    {"name": "Backend", "task": "API Development"},
                    {"name": "Database", "task": "Schema Design"},
                    {"name": "DevOps", "task": "Infrastructure"}
                ]
            }
        
        # Create workspace directories
        workspace_path = self.base_path / company_name
        workspace_path.mkdir(exist_ok=True)
        
        # Create organization directories
        for i, org in enumerate(config["orgs"], 1):
            org_dir = workspace_path / f"org-{i:02d}"
            org_dir.mkdir(exist_ok=True)
            
            # Create desk directories for PM and Workers
            for role in ["boss", "worker-a", "worker-b", "worker-c"]:
                desk_dir = org_dir / f"{i:02d}{role}"
                desk_dir.mkdir(exist_ok=True)
                
                # Create README
                readme_path = desk_dir / "README.md"
                readme_content = f"""# {org['name']} - {role.title()}

Organization: {org['name']}
Task: {org['task']}
Role: {role.title()}
Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
                readme_path.write_text(readme_content)
        
        # Create tmux session
        print(f"🏗️ Starting company: '{company_name}'")
        
        # Create new tmux session
        self._run_command(["tmux", "new-session", "-d", "-s", company_name])
        
        # Create windows for each organization instead of all panes in one window
        for i, org in enumerate(config["orgs"]):
            if i > 0:  # First window already exists
                self._run_command(["tmux", "new-window", "-t", company_name, "-n", f"org-{i+1:02d}"])
            else:
                self._run_command(["tmux", "rename-window", "-t", f"{company_name}:0", f"org-{i+1:02d}"])
            
            # Create 3 more panes in each window (total 4 per window)
            for j in range(3):
                self._run_command(["tmux", "split-window", "-t", f"{company_name}:{i}", "-h"])
                self._run_command(["tmux", "select-layout", "-t", f"{company_name}:{i}", "tiled"])
        
        # Set pane titles and change to appropriate directories
        for org_idx, org in enumerate(config["orgs"], 1):
            window_idx = org_idx - 1
            for pane_idx, role in enumerate(["boss", "worker-a", "worker-b", "worker-c"]):
                org_dir = workspace_path / f"org-{org_idx:02d}"
                desk_dir = org_dir / f"{org_idx:02d}{role}"
                
                # Send commands to each pane
                self._run_command([
                    "tmux", "send-keys", "-t", f"{company_name}:{window_idx}.{pane_idx}",
                    f"cd {desk_dir}", "Enter"
                ])
                
                # Set pane title
                title = f"{org['name'][:8]}-{role[:6]}"
                self._run_command([
                    "tmux", "select-pane", "-t", f"{company_name}:{window_idx}.{pane_idx}",
                    "-T", title
                ])
        
        # Save session info
        sessions[company_name] = {
            "created": datetime.now().isoformat(),
            "workspace": str(workspace_path),
            "config": config,
            "status": "running"
        }
        self._save_sessions(sessions)
        
        print(f"✓ Company '{company_name}' started successfully")
        print(f"  Workspace: {workspace_path}")
        print(f"  Organizations: {len(config['orgs'])}")
        print(f"  Total desks: {len(config['orgs']) * 4}")
        print(f"\nTo attach: haconiwa-mini attach {company_name}")
        
        return True
    
    def stop(self, company_name: str, clean_dirs: bool = False):
        """Stop a running haconiwa environment"""
        sessions = self._load_sessions()
        
        if company_name not in sessions:
            print(f"✗ Company '{company_name}' not found")
            return False
        
        session_info = sessions[company_name]
        
        # Kill tmux session if exists
        if self._tmux_session_exists(company_name):
            print(f"🛑 Stopping company: '{company_name}'")
            self._run_command(["tmux", "kill-session", "-t", company_name])
            print(f"✓ Tmux session terminated")
        else:
            print(f"ℹ️ Tmux session '{company_name}' not running")
        
        # Clean directories if requested
        if clean_dirs:
            workspace_path = Path(session_info["workspace"])
            if workspace_path.exists():
                import shutil
                shutil.rmtree(workspace_path)
                print(f"✓ Workspace directory removed: {workspace_path}")
        
        # Update session status
        sessions[company_name]["status"] = "stopped"
        self._save_sessions(sessions)
        
        print(f"✓ Company '{company_name}' stopped")
        return True
    
    def list_companies(self):
        """List all companies"""
        sessions = self._load_sessions()
        
        if not sessions:
            print("No companies found")
            return
        
        print("Companies:")
        print("-" * 60)
        
        for name, info in sessions.items():
            running = self._tmux_session_exists(name)
            status = "🟢 running" if running else "🔴 stopped"
            created = datetime.fromisoformat(info["created"]).strftime("%Y-%m-%d %H:%M")
            print(f"  {name:<20} {status:<15} Created: {created}")
            print(f"    Workspace: {info['workspace']}")
            print()
    
    def attach(self, company_name: str):
        """Attach to a running company"""
        if not self._tmux_session_exists(company_name):
            print(f"✗ Company '{company_name}' is not running")
            return False
        
        print(f"📎 Attaching to company: '{company_name}'")
        os.system(f"tmux attach-session -t {company_name}")
        return True
    
    def run_command(self, company_name: str, command: str, pane_filter: str = None):
        """Run a command in all or specific panes"""
        if not self._tmux_session_exists(company_name):
            print(f"✗ Company '{company_name}' is not running")
            return False
        
        sessions = self._load_sessions()
        if company_name not in sessions:
            print(f"✗ Company '{company_name}' not found")
            return False
        
        config = sessions[company_name]["config"]
        
        print(f"🚀 Running command in company: '{company_name}'")
        
        pane_index = 0
        for org_idx, org in enumerate(config["orgs"], 1):
            for role_idx, role in enumerate(["boss", "worker-a", "worker-b", "worker-c"]):
                # Apply filter if specified
                if pane_filter:
                    if pane_filter not in org["name"].lower() and pane_filter not in role:
                        pane_index += 1
                        continue
                
                # Send command to pane
                self._run_command([
                    "tmux", "send-keys", "-t", f"{company_name}:{pane_index}",
                    command, "Enter"
                ])
                
                print(f"  ✓ Sent to {org['name']}-{role} (pane {pane_index})")
                pane_index += 1
        
        return True


def main():
    parser = argparse.ArgumentParser(description="Haconiwa Mini - Simplified multi-agent environment manager")
    parser.add_argument("--base-path", help="Base path for workspaces", default=None)
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start a new company environment")
    start_parser.add_argument("name", help="Company name")
    start_parser.add_argument("--org1", nargs=2, metavar=("NAME", "TASK"), help="Organization 1 name and task")
    start_parser.add_argument("--org2", nargs=2, metavar=("NAME", "TASK"), help="Organization 2 name and task")
    start_parser.add_argument("--org3", nargs=2, metavar=("NAME", "TASK"), help="Organization 3 name and task")
    start_parser.add_argument("--org4", nargs=2, metavar=("NAME", "TASK"), help="Organization 4 name and task")
    
    # Stop command
    stop_parser = subparsers.add_parser("stop", help="Stop a running company")
    stop_parser.add_argument("name", help="Company name")
    stop_parser.add_argument("--clean-dirs", action="store_true", help="Remove workspace directories")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List all companies")
    
    # Attach command
    attach_parser = subparsers.add_parser("attach", help="Attach to a running company")
    attach_parser.add_argument("name", help="Company name")
    
    # Run command
    run_parser = subparsers.add_parser("run", help="Run command in company panes")
    run_parser.add_argument("name", help="Company name")
    run_parser.add_argument("--cmd", required=True, help="Command to run")
    run_parser.add_argument("--filter", help="Filter panes by organization or role name")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Initialize Haconiwa Mini
    hm = HaconiwaMini(base_path=args.base_path)
    
    if args.command == "start":
        config = {"orgs": []}
        
        # Parse organization configurations
        for i, org_arg in enumerate([args.org1, args.org2, args.org3, args.org4], 1):
            if org_arg:
                config["orgs"].append({"name": org_arg[0], "task": org_arg[1]})
            else:
                # Default organizations
                defaults = [
                    ("Frontend", "UI Development"),
                    ("Backend", "API Development"),
                    ("Database", "Schema Design"),
                    ("DevOps", "Infrastructure")
                ]
                if i <= len(defaults):
                    config["orgs"].append({"name": defaults[i-1][0], "task": defaults[i-1][1]})
        
        hm.start(args.name, config)
    
    elif args.command == "stop":
        hm.stop(args.name, clean_dirs=args.clean_dirs)
    
    elif args.command == "list":
        hm.list_companies()
    
    elif args.command == "attach":
        hm.attach(args.name)
    
    elif args.command == "run":
        hm.run_command(args.name, args.cmd, args.filter)


if __name__ == "__main__":
    main()