# TODO CLI 📋

一个简单的命令行待办事项管理器。

## 功能特点

- ✅ 添加新任务
- 📋 列出所有任务
- ✔️ 标记任务为完成
- 🗑️ 删除任务
- 💾 自动保存任务数据到本地文件

## 快速开始

### 1. 克隆或下载项目

```bash
cd todo-cli
```

### 2. 运行

```bash
python main.py help
```

### 3. 使用示例

```bash
# 添加任务
python main.py add "买牛奶"
python main.py add "完成作业"
python main.py add "回复邮件"

# 查看所有任务
python main.py list

# 标记任务完成（假设任务编号为 1）
python main.py done 1

# 删除任务
python main.py delete 1
```

## 命令说明

| 命令 | 说明 | 示例 |
|------|------|------|
| `add <描述>` | 添加新任务 | `python main.py add "购物"` |
| `list` | 列出所有任务 | `python main.py list` |
| `done <编号>` | 标记任务完成 | `python main.py done 1` |
| `delete <编号>` | 删除任务 | `python main.py delete 1` |
| `help` | 显示帮助信息 | `python main.py help` |

## 项目结构

```
todo-cli/
├── main.py              # 主入口文件
├── utils/
│   └── helper.py        # 辅助函数模块
├── requirements.txt     # 依赖列表
├── README.md           # 项目说明
└── todos.json          # 任务数据文件（运行时自动生成）
```

## 技术栈

- Python 3.6+
- 标准库（json, os, sys）

## 数据存储

任务数据保存在 `todos.json` 文件中，位于项目根目录。
数据格式为 JSON，便于查看和手动编辑。

## 扩展建议

如需增强功能，可以考虑：

- 使用 `click` 或 `argparse` 改进命令行解析
- 添加任务优先级和截止日期
- 添加任务分类/标签功能
- 添加搜索功能
- 使用 SQLite 替代 JSON 存储

## 许可证

MIT License

---

**享受高效的工作流程！** 🚀
