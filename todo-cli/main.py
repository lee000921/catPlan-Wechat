#!/usr/bin/env python3
"""
TODO CLI - 简单的命令行待办事项管理器
"""

import sys
from utils.helper import load_todos, save_todos, add_todo, list_todos, complete_todo, delete_todo


def print_usage():
    """打印使用说明"""
    usage = """
TODO CLI - 命令行待办事项管理器

用法:
    python main.py add <任务描述>     添加新任务
    python main.py list               列出所有任务
    python main.py done <任务编号>     标记任务为完成
    python main.py delete <任务编号>   删除任务
    python main.py help               显示此帮助信息

示例:
    python main.py add "买牛奶"
    python main.py list
    python main.py done 1
    python main.py delete 1
"""
    print(usage)


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print_usage()
        return

    command = sys.argv[1].lower()
    
    # 加载任务列表
    todos = load_todos()

    if command == "add":
        if len(sys.argv) < 3:
            print("❌ 错误：请提供任务描述")
            print("用法：python main.py add <任务描述>")
            return
        description = " ".join(sys.argv[2:])
        add_todo(todos, description)
        save_todos(todos)
        print(f"✅ 已添加任务：{description}")

    elif command == "list":
        list_todos(todos)

    elif command == "done":
        if len(sys.argv) < 3:
            print("❌ 错误：请提供任务编号")
            print("用法：python main.py done <任务编号>")
            return
        try:
            task_id = int(sys.argv[2])
            complete_todo(todos, task_id)
            save_todos(todos)
        except ValueError:
            print("❌ 错误：任务编号必须是数字")

    elif command == "delete":
        if len(sys.argv) < 3:
            print("❌ 错误：请提供任务编号")
            print("用法：python main.py delete <任务编号>")
            return
        try:
            task_id = int(sys.argv[2])
            delete_todo(todos, task_id)
            save_todos(todos)
        except ValueError:
            print("❌ 错误：任务编号必须是数字")

    elif command == "help":
        print_usage()

    else:
        print(f"❌ 未知命令：{command}")
        print_usage()


if __name__ == "__main__":
    main()
