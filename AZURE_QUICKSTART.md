# 猫猫天团 Azure 服务器部署指南

> 在 Azure Linux VM（Ubuntu）上部署 ClawTeam + Discord 桥接，让猫猫们在云端 24 小时工作。

---

## 一、SSH 登录 Azure 服务器

```bash
# 首次使用前先设置密钥权限（只需做一次，否则 SSH 会报错拒绝）
chmod 600 /Users/lynnli/Downloads/test_key.pem

# 登录（替换为你的真实 IP）
ssh -i /Users/lynnli/Downloads/test_key.pem azureuser@<Azure服务器公网IP>
```

> Azure 公网 IP 在 Azure Portal → 虚拟机 → 概述页面查看。

---

## 二、服务器环境初始化（首次）

### 1. 更新系统 & 安装基础依赖

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y tmux git curl wget build-essential python3-full pipx
```

### 2. 确认 Python 版本

```bash
python3 --version  # 需要 >= 3.10
```

### 3. 安装 Node.js（Claude Code 依赖）

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # 确认 >= 18
```

### 4. 安装 Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
claude --version  # 确认安装成功
```

### 5. 安装 ClawTeam

Ubuntu 新版系统不允许直接 `pip3 install`，用 `pipx` 安装 CLI 工具：

```bash
# 让 pipx 路径生效
pipx ensurepath
source ~/.bashrc

# 从源码安装 ClawTeam
git clone https://github.com/HKUDS/ClawTeam.git ~/ClawTeam
pipx install -e ~/ClawTeam

# 确认安装
clawteam --version
```

### 6. 安装 Discord 桥接依赖

服务器上已有 `clawVenv` 虚拟环境，激活后直接安装：

```bash
source ~/clawVenv/bin/activate   # 激活 venv（提示符变成 (clawVenv)）
pip install "discord.py>=2.3" aiohttp
```

---

## 三、配置环境变量

写入 `~/.bashrc`，每次登录自动生效：

```bash
cat >> ~/.bashrc << 'EOF'

# === ClawTeam & Discord Bridge ===
export DISCORD_BOT_TOKEN='你的BotToken'
export DISCORD_WEBHOOK_URL='你的WebhookURL'
export CLAWTEAM_BRIDGE_TEAM='my-maomao'
export CLAWTEAM_BRIDGE_LEADER='zong-cai-miao'
export CLAWTEAM_DATA_DIR="$HOME/.clawteam"
EOF

source ~/.bashrc
```


---

## 四、启动猫猫团队

```bash
# 确认模板存在
clawteam template list

# 在 tmux 里启动（防止 SSH 断开后进程死掉）
tmux new-session -d -s maomao
tmux send-keys -t maomao "clawteam launch maomao-save-world --team my-maomao --goal '你的目标'" Enter

# 查看启动情况
tmux attach -t maomao
# 退出 tmux 但保持运行：Ctrl+B，然后按 D
```

---

## 五、启动 Discord 桥接

```bash
# 新建一个专门给桥接用的 tmux 窗口
tmux new-window -t maomao -n bridge

# 用 venv 里的 python 启动桥接
tmux send-keys -t maomao:bridge "~/clawVenv/bin/python ~/ClawTeam/examples/discord_clawteam_bridge.py" Enter

# 确认桥接已连上
tmux attach -t maomao:bridge
# 看到 "Bridge 已登录" 就成功了
# 退出：Ctrl+B，然后按 D
```

---

## 六、日常操作速查

### 查看运行状态

```bash
tmux ls                      # 列出所有 tmux 会话
tmux attach -t maomao        # 进入猫猫主会话
tmux attach -t maomao:bridge # 进入桥接窗口
```

### 看板监控

```bash
clawteam board show my-maomao                        # 终端看板
clawteam board live my-maomao --interval 3           # 自动刷新
clawteam board serve --host 0.0.0.0 --port 8080      # Web 仪表板
# 访问 http://<Azure公网IP>:8080
```

### 手动给猫猫发消息

```bash
clawteam inbox send my-maomao zong-cai-miao "任务更新"
clawteam inbox send my-maomao discord-human "报告：任务完成"
clawteam inbox receive my-maomao
```

### 重启桥接

```bash
pkill -f discord_clawteam_bridge.py
tmux send-keys -t maomao:bridge "~/clawVenv/bin/python ~/ClawTeam/examples/discord_clawteam_bridge.py" Enter
```

### 清理团队

```bash
clawteam team cleanup my-maomao --force
```

---

## 七、开放 Web 仪表板端口（可选）

1. Azure Portal → 虚拟机 → 网络 → 添加入站端口规则
2. 目标端口：`8080`，协议：`TCP`，操作：`允许`
3. 访问 `http://<Azure公网IP>:8080`

---

## 八、SSH 断开后保持运行

所有服务都跑在 `tmux` 里，SSH 断开后自动保持。重新连接：

```bash
ssh -i /Users/lynnli/Downloads/test_key.pem azureuser@<Azure公网IP>
tmux attach -t maomao
```

---

## 九、完整启动顺序（速查）

```bash
# 1. SSH 登录
ssh -i /Users/lynnli/Downloads/test_key.pem azureuser@<Azure公网IP>

# 2. 加载环境变量
source ~/.bashrc

# 3. 启动猫猫团队
tmux new-session -d -s maomao
tmux send-keys -t maomao "clawteam launch maomao-save-world --team my-maomao --goal '你的目标'" Enter

# 4. 启动 Discord 桥接
tmux new-window -t maomao -n bridge
tmux send-keys -t maomao:bridge "~/clawVenv/bin/python ~/ClawTeam/examples/discord_clawteam_bridge.py" Enter

# 5. 确认状态
tmux ls
clawteam board show my-maomao
```
