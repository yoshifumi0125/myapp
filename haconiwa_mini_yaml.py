#!/usr/bin/env python3
"""
Haconiwa Mini YAML - Enhanced version with YAML configuration support
"""

import argparse
import subprocess
import sys
import os
import json
import yaml
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class HaconiwaYAML:
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
            json.dump(sessions, f, indent=2, ensure_ascii=False)
    
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
    
    def apply(self, yaml_file: str, dry_run: bool = False):
        """Apply YAML configuration to create/update environments"""
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
        except Exception as e:
            print(f"✗ Failed to load YAML file: {e}")
            return False
        
        # Validate configuration
        if 'version' not in config:
            print("✗ Missing 'version' field in YAML")
            return False
        
        if 'space' not in config:
            print("✗ Missing 'space' field in YAML")
            return False
        
        space_config = config['space']
        company_name = space_config.get('name', 'default-company')
        
        print(f"📋 Applying configuration for company: '{company_name}'")
        print(f"   Version: {config['version']}")
        
        if dry_run:
            print("\n🔍 DRY RUN MODE - No changes will be made")
            self._print_plan(space_config)
            return True
        
        # Create the environment
        return self._create_from_config(company_name, space_config)
    
    def _print_plan(self, space_config: Dict):
        """Print the execution plan"""
        rooms = space_config.get('rooms', [])
        agents = space_config.get('agents', [])
        
        print(f"\n📊 Execution Plan:")
        print(f"   Rooms: {len(rooms)}")
        print(f"   Total Agents: {len(agents)}")
        
        # Group agents by room
        for room in rooms:
            room_agents = [a for a in agents if a.get('room') == room['name']]
            print(f"\n   Room '{room['name']}':")
            print(f"     Agents: {len(room_agents)}")
            for agent in room_agents:
                print(f"       - {agent['name']} ({agent.get('role', 'worker')})")
    
    def _create_from_config(self, company_name: str, space_config: Dict) -> bool:
        """Create environment from configuration"""
        sessions = self._load_sessions()
        
        # Check if already exists
        if company_name in sessions and self._tmux_session_exists(company_name):
            print(f"ℹ️ Company '{company_name}' already exists. Use 'stop' first to recreate.")
            return False
        
        # Parse configuration
        base_path = Path(space_config.get('base_path', str(self.base_path / company_name)))
        rooms = space_config.get('rooms', [])
        agents = space_config.get('agents', [])
        
        # Create workspace directories
        self._create_workspace_structure(base_path, agents)
        
        # Create tmux session with rooms (windows)
        print(f"🏗️ Creating tmux session: '{company_name}'")
        
        # Create new session with first window
        self._run_command(["tmux", "new-session", "-d", "-s", company_name, "-n", rooms[0]['name'] if rooms else "main"])
        
        # Create additional windows for other rooms
        for i, room in enumerate(rooms[1:], 1):
            self._run_command(["tmux", "new-window", "-t", company_name, "-n", room['name']])
        
        # Set up agents in each room
        for room_idx, room in enumerate(rooms):
            room_agents = [a for a in agents if a.get('room') == room['name']]
            
            if not room_agents:
                continue
            
            # Create panes for agents in this room
            window_name = f"{company_name}:{room_idx}"
            
            # Create additional panes (first pane already exists)
            for i in range(len(room_agents) - 1):
                self._run_command(["tmux", "split-window", "-t", window_name, "-h"])
                self._run_command(["tmux", "select-layout", "-t", window_name, "tiled"])
            
            # Configure each pane
            for pane_idx, agent in enumerate(room_agents):
                agent_dir = base_path / "agents" / agent['name']
                
                # Change to agent directory
                self._run_command([
                    "tmux", "send-keys", "-t", f"{window_name}.{pane_idx}",
                    f"cd {agent_dir}", "Enter"
                ])
                
                # Set pane title
                self._run_command([
                    "tmux", "select-pane", "-t", f"{window_name}.{pane_idx}",
                    "-T", agent['name']
                ])
                
                # Run initialization command if specified
                if 'init_command' in agent:
                    self._run_command([
                        "tmux", "send-keys", "-t", f"{window_name}.{pane_idx}",
                        agent['init_command'], "Enter"
                    ])
        
        # Save session information
        sessions[company_name] = {
            "created": datetime.now().isoformat(),
            "workspace": str(base_path),
            "config": space_config,
            "status": "running",
            "rooms": len(rooms),
            "agents": len(agents)
        }
        self._save_sessions(sessions)
        
        print(f"\n✅ Company '{company_name}' created successfully!")
        print(f"   Workspace: {base_path}")
        print(f"   Rooms: {len(rooms)}")
        print(f"   Agents: {len(agents)}")
        print(f"\n📎 To attach: haconiwa-yaml attach {company_name}")
        
        return True
    
    def _create_workspace_structure(self, base_path: Path, agents: List[Dict]):
        """Create directory structure for agents"""
        base_path.mkdir(parents=True, exist_ok=True)
        agents_dir = base_path / "agents"
        agents_dir.mkdir(exist_ok=True)
        
        # Create directory for each agent
        for agent in agents:
            agent_dir = agents_dir / agent['name']
            agent_dir.mkdir(exist_ok=True)
            
            # Create README
            readme_path = agent_dir / "README.md"
            readme_content = f"""# {agent['name']}

Role: {agent.get('role', 'worker')}
Room: {agent.get('room', 'main')}
Organization: {agent.get('organization', 'default')}
Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Description
{agent.get('description', 'No description provided')}
"""
            readme_path.write_text(readme_content)
            
            # Create task file if specified
            if 'task' in agent:
                task_file = agent_dir / "current_task.md"
                task_file.write_text(f"# Current Task\n\n{agent['task']}\n")
    
    def stop(self, company_name: str, clean_dirs: bool = False):
        """Stop a running company"""
        sessions = self._load_sessions()
        
        if company_name not in sessions:
            print(f"✗ Company '{company_name}' not found")
            return False
        
        session_info = sessions[company_name]
        
        # Kill tmux session
        if self._tmux_session_exists(company_name):
            print(f"🛑 Stopping company: '{company_name}'")
            self._run_command(["tmux", "kill-session", "-t", company_name])
            print(f"✓ Tmux session terminated")
        
        # Clean directories if requested
        if clean_dirs:
            workspace_path = Path(session_info["workspace"])
            if workspace_path.exists():
                import shutil
                shutil.rmtree(workspace_path)
                print(f"✓ Workspace removed: {workspace_path}")
        
        # Remove from sessions
        del sessions[company_name]
        self._save_sessions(sessions)
        
        print(f"✓ Company '{company_name}' stopped")
        return True
    
    def list_companies(self):
        """List all companies"""
        sessions = self._load_sessions()
        
        if not sessions:
            print("No companies found")
            return
        
        print("🏢 Companies:")
        print("=" * 70)
        
        for name, info in sessions.items():
            running = self._tmux_session_exists(name)
            status = "🟢 running" if running else "🔴 stopped"
            created = datetime.fromisoformat(info["created"]).strftime("%Y-%m-%d %H:%M")
            
            print(f"\n📌 {name}")
            print(f"   Status: {status}")
            print(f"   Created: {created}")
            print(f"   Workspace: {info['workspace']}")
            print(f"   Rooms: {info.get('rooms', 'N/A')}")
            print(f"   Agents: {info.get('agents', 'N/A')}")
    
    def attach(self, company_name: str, room: str = None):
        """Attach to a running company"""
        if not self._tmux_session_exists(company_name):
            print(f"✗ Company '{company_name}' is not running")
            return False
        
        print(f"📎 Attaching to company: '{company_name}'")
        
        if room:
            # Attach to specific window/room
            os.system(f"tmux attach-session -t {company_name}:{room}")
        else:
            os.system(f"tmux attach-session -t {company_name}")
        
        return True


def create_example_yaml():
    """Create an example YAML configuration file"""
    example_config = """version: "1.0"
metadata:
  description: "Multi-room development environment"
  author: "Haconiwa Mini"

space:
  name: "dev-company"
  base_path: "./dev-workspace"
  
  rooms:
    - name: "frontend"
      description: "Frontend development room"
    - name: "backend"
      description: "Backend development room"
    - name: "devops"
      description: "DevOps and infrastructure room"
  
  agents:
    # Frontend team
    - name: "frontend-pm"
      role: "pm"
      room: "frontend"
      organization: "frontend-team"
      description: "Frontend project manager"
      task: "Coordinate UI/UX development"
    
    - name: "react-dev"
      role: "worker"
      room: "frontend"
      organization: "frontend-team"
      description: "React developer"
      task: "Implement React components"
    
    - name: "css-dev"
      role: "worker"
      room: "frontend"
      organization: "frontend-team"
      description: "CSS specialist"
      task: "Design and style components"
    
    # Backend team
    - name: "backend-pm"
      role: "pm"
      room: "backend"
      organization: "backend-team"
      description: "Backend project manager"
      task: "Coordinate API development"
    
    - name: "api-dev"
      role: "worker"
      room: "backend"
      organization: "backend-team"
      description: "API developer"
      task: "Implement REST APIs"
    
    - name: "db-dev"
      role: "worker"
      room: "backend"
      organization: "backend-team"
      description: "Database developer"
      task: "Design database schema"
    
    # DevOps team
    - name: "devops-pm"
      role: "pm"
      room: "devops"
      organization: "devops-team"
      description: "DevOps project manager"
      task: "Coordinate infrastructure"
    
    - name: "infra-dev"
      role: "worker"
      room: "devops"
      organization: "devops-team"
      description: "Infrastructure engineer"
      task: "Setup cloud infrastructure"
      init_command: "echo 'Infrastructure engineer ready'"
"""
    
    filename = "haconiwa-example.yaml"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(example_config)
    
    print(f"✅ Created example configuration: {filename}")
    return filename


def main():
    parser = argparse.ArgumentParser(description="Haconiwa YAML - Multi-agent environment with YAML support")
    parser.add_argument("--base-path", help="Default base path for workspaces", default=None)
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Apply command (like kubectl apply)
    apply_parser = subparsers.add_parser("apply", help="Apply YAML configuration")
    apply_parser.add_argument("-f", "--file", required=True, help="YAML configuration file")
    apply_parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    
    # Stop command
    stop_parser = subparsers.add_parser("stop", help="Stop a running company")
    stop_parser.add_argument("name", help="Company name")
    stop_parser.add_argument("--clean-dirs", action="store_true", help="Remove workspace directories")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List all companies")
    
    # Attach command
    attach_parser = subparsers.add_parser("attach", help="Attach to a running company")
    attach_parser.add_argument("name", help="Company name")
    attach_parser.add_argument("-r", "--room", help="Specific room to attach to")
    
    # Example command
    example_parser = subparsers.add_parser("example", help="Create example YAML configuration")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Initialize
    hy = HaconiwaYAML(base_path=args.base_path)
    
    if args.command == "apply":
        hy.apply(args.file, dry_run=args.dry_run)
    
    elif args.command == "stop":
        hy.stop(args.name, clean_dirs=args.clean_dirs)
    
    elif args.command == "list":
        hy.list_companies()
    
    elif args.command == "attach":
        hy.attach(args.name, room=args.room)
    
    elif args.command == "example":
        create_example_yaml()


if __name__ == "__main__":
    main()