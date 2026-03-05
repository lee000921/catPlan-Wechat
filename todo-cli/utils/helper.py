"""
辅助函数模块 - 处理待办事项的存储和操作
"""

import json
import os

# 数据文件路径
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "todos.json")


def load_todos():
    """从文件加载待办事项列表"""
    if not os.path.exists(DATA_FILE):
        return []
    
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_todos(todos):
    """将待办事项列表保存到文件"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(todos, f, ensure_ascii=False, indent=2)


def add_todo(todos, description):
    """添加新的待办事项"""
    todo = {
        "id": len(todos) + 1,
        "description": description,
        "completed": False
    }
    todos.append(todo)
    return todo


def list_todos(todos):
    """列出所有待办事项"""
    if not todos:
        print("📋 暂无待办事项")
        return
    
    print("\n📋 待办事项列表:")
    print("-" * 50)
    for todo in todos:
        status = "✅" if todo["completed"] else "⬜"
        print(f"{status} [{todo['id']}] {todo['description']}")
    print("-" * 50)
    print(f"总计：{len(todos)} 个任务")


def complete_todo(todos, task_id):
    """标记任务为完成"""
    for todo in todos:
        if todo["id"] == task_id:
            if todo["completed"]:
                print(f"⚠️  任务 {task_id} 已经完成过了")
            else:
                todo["completed"] = True
                print(f"✅ 任务 {task_id} 已标记为完成：{todo['description']}")
            return
    
    print(f"❌ 未找到任务编号：{task_id}")


def delete_todo(todos, task_id):
    """删除任务"""
    for i, todo in enumerate(todos):
        if todo["id"] == task_id:
            removed = todos.pop(i)
            print(f"🗑️  已删除任务：{removed['description']}")
            # 重新编号
            for idx, t in enumerate(todos, 1):
                t["id"] = idx
            return
    
    print(f"❌ 未找到任务编号：{task_id}")
