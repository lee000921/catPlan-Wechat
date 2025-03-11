// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const taskCollection = db.collection('tasks')

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 先清空集合（如果需要重新初始化）

    // 获取所有任务
    const allTasks = await taskCollection.get()
      
    // 批量删除任务
    const deletePromises = allTasks.data.map(task => {
      return taskCollection.doc(task._id).remove()
    })
      
    await Promise.all(deletePromises)

    // 预定义的任务数据
    const tasks = [
      {
        title: '健康小猫咪——早睡',
        desc: '每天晚上12点前睡觉，保证充足的睡眠时间，有助于身体恢复和精神集中。建议使用闹钟提醒自己按时睡觉。',
        points: 1,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '健康小猫咪——早起',
        desc: '每天早上8点前起床，保证充足的睡眠时间，有助于身体恢复和精神集中。建议使用闹钟提醒自己按时起床。',
        points: 1,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '健康小猫咪——运动',
        desc: '每天至少进行30分钟的有氧运动，如快走、慢跑、游泳等。可以选择自己喜欢的运动方式，坚持每天进行。',
        points: 1,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '勤奋小猫咪——学习时长1小时',
        desc: '每天学习1小时，可以选择自己喜欢的学习方式，如看书、听讲座、做练习等。',
        points: 1,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '勤奋小猫咪——学习时长3小时',
        desc: '每天学习3小时，可以选择自己喜欢的学习方式，如看书、听讲座、做练习等。',
        points: 1,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '勤奋小猫咪——学习时长5小时',
        desc: '每天学习5小时，可以选择自己喜欢的学习方式，如看书、听讲座、做练习等。',
        points: 2,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '勤奋小猫咪——学习时长8小时',
        desc: '每天学习8小时，可以选择自己喜欢的学习方式，如看书、听讲座、做练习等。',
        points: 2,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '勤奋小猫咪——学习时长10小时',
        desc: '每天学习10小时，可以选择自己喜欢的学习方式，如看书、听讲座、做练习等。',
        points: 3,
        category: 'daily',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计完成5天任务',
        desc: '连续5天每天都完成任务，可以获得额外的奖励。',
        points: 1,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计完成10天任务',
        desc: '连续10天每天都完成任务，可以获得额外的奖励。',
        points: 2,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计完成15天任务',
        desc: '连续15天每天都完成任务，可以获得额外的奖励。',
        points: 3,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计完成20天任务',
        desc: '连续20天每天都完成任务，可以获得额外的奖励。',
        points: 4,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计完成25天任务',
        desc: '连续25天每天都完成任务，可以获得额外的奖励。',
        points: 5,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计看完5节网课',
        desc: '累计看完5节网课，可以获得额外的奖励。',
        points: 1,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计看完10节网课',
        desc: '累计看完10节网课，可以获得额外的奖励。',
        points: 2,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计背100个单词',
        desc: '累计背100个单词，可以获得额外的奖励。',
        points: 1,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——累计背200个单词',
        desc: '累计背200个单词，可以获得额外的奖励。',
        points: 2,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——完成内科学复习',
        desc: '完成内科学复习，可以获得额外的奖励。',
        points: 100,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        title: '坚持小猫咪——完成外科学复习',
        desc: '完成外科学复习，可以获得额外的奖励。',
        points: 100,
        category: 'growth',
        progress: 0,
        maxProgress: 1,
        completed: false
      }
    ]

    // 批量添加任务到数据库
    for (let task of tasks) {
      await taskCollection.add({
        data: task
      })
    }

    return {
      success: true,
      message: `成功初始化 ${tasks.length} 个任务`,
      count: tasks.length
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: '初始化任务失败',
      error: err
    }
  }
}