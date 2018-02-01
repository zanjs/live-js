// import { createPool, poolAll } from "swimmer"
const createPool = require("swimmer").createPool
const poolAll = require("swimmer").poolAll

// Knobs
const poolAllTasks = 20
const poolAllThrottle = 3
const customPoolTasks = 100
const customPoolThrottle = 10
const potentialTaskDuration = 1000

// Utils
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const newTask = (taskNum, failRate = 0) => async () => {

  
  await sleep(Math.random() * potentialTaskDuration)

  if (Math.random() < failRate) {
    throw new Error(`Task failed: ${taskNum}`)
  }
  return taskNum
}
const countdown = async () => {
  console.log("5...")
  await sleep(1000)
  console.log("4...")
  await sleep(1000)
  console.log("3...")
  await sleep(1000)
  console.log("2...")
  await sleep(1000)
  console.log("1...")
  await sleep(1000)
}
let uid = 0

/// DEMO

// Create a custom pool
const pool = createPool({
  concurrency: 5
})

// Subscribe to pool errors
pool.onError((err, task) => {
  console.log("Repooling Errored Task")
  pool.add(task)
})

// Subscribe to pool successes
pool.onSuccess((res, task) => {
  console.log(`Task Complete: ${res}`)
})

// Subscribe to pool settled
pool.onSettled(() => console.log("Pool settled! Feed me more?"))

// Function to add some tasks
const feed = () => {
  let i = 0
  while (i < customPoolTasks) {
    // Add a task to the pool, a function that returns a promise
    pool.add(newTask(uid++, 0.1))
    i++
  }
}

const testPoolAll = async () => {
  console.log("Testing poolAll() in...")
  await sleep(500)
  await countdown()
  console.log(`Executing 20 tasks with throttle set to ${poolAllThrottle}`)
  // create an array of task functions
  const tasks = Array.from(Array(poolAllTasks), d => d).map((d, i) =>
    newTask(i, 0)
  )
  try {
    const res = await poolAll(tasks, poolAllThrottle)
    console.log("Results:", res)
  } catch (e) {
    console.error(e)
  }
}

const testCustomPool = async () => {
  console.log("")
  await sleep(2000)
  console.log("Testing createPool() in 5s...")
  console.log(`Pool created with throttle set to ${customPoolThrottle}`)
  console.log(`Added ${customPoolTasks} random tasks`)
  await sleep(500)
  await countdown()
  feed()

  // start the pool
  pool.start()
  await sleep(3000)

  // Pause
  pool.stop()
  console.warn("Pausing for 5s...")
  await sleep(5000)

  pool.start()
  await sleep(5000)
  pool.throttle(3)
  console.warn("Changed throttle to 3")
}

const test = async () => {
  await sleep(2000)
  await testPoolAll()
  await testCustomPool()
}

test()
