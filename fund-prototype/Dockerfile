FROM python:3.9-slim

WORKDIR /app

# 安装 AkShare
RUN pip install akshare -i https://pypi.tuna.tsinghua.edu.cn/simple

# 复制代码
COPY fund-docker.py /app/

# 开放端口
EXPOSE 8000

# 启动服务
CMD ["python3", "fund-docker.py"]
