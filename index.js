const mineflayer = require('mineflayer')
const express = require('express')

// ===== WEB (Render / UptimeRobot) =====
const app = express()
const PORT = process.env.PORT || 3000
let botStatus = '⏳ starting...'
let bot

app.get('/', (req, res) => {
  res.send(`<h2>🤖 AFK BOT</h2><p>${botStatus}</p>`)
})

app.listen(PORT, () => console.log('🌐 WEB OK:', PORT))

// ===== SOZLAMALAR =====
const HOST = 'articraft.uz'
const MC_PORT = 25565
const USERNAME = 'sh_ssss_'
const VERSION = '1.21'
const PASSWORD = 'uwu111'

const ADMIN = 'itzRellixsMF'

const RECONNECT_DELAY = 5000
const ANTI_AFK_INTERVAL = 5 * 60 * 1000

let loggedIn = false
let reconnecting = false
let antiAfkTimer = null

// ===== START =====
function startBot () {
  loggedIn = false
  botStatus = '🔄 ulanmoqda'

  bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: VERSION
  })

  setupEvents()
}

// ===== EVENTS =====
function setupEvents () {

  bot.on('spawn', () => {
    console.log('🟢 SPAWN')
    botStatus = '🟡 tekshirilyapti'

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`)
    }, 2000)

    setTimeout(() => {
      bot.chat('/server smp')
    }, 6000)

    setTimeout(() => {
      bot.chat('/team home')
      startAntiAfk()
      botStatus = '🟢 AFK (SMP)'
    }, 10000)
  })

  // ===== CHAT =====
  // ===== CHAT =====
bot.on('message', msg => {
  const text = msg.toString()
  console.log('💬', text)

  // LOGIN aniqlansa
  if (!loggedIn && /login|ʟᴏɢɪɴ|\/l/i.test(text)) {
    bot.chat(`/login ${PASSWORD}`)
    loggedIn = true
  }

  // PM xabarlarni aniqlash
  const pm = text.match(/\[([^\]]+)\s→\sme\]\s(.+)/i)
  if (pm) {
    const sender = pm[1]
    const message = pm[2]

    // Agar xabar admindan bo‘lsa sukutda qoladi
    if (sender === ADMIN) {
      console.log('📩 ADMIN PM:', message)
    } else {
      // Boshqalar global chatga yoziladi
      bot.chat(`${sender}: ${message}`)
      console.log('🌐 Global chatga takrorlandi:', message)
    }
  }
})


  // ===== O‘LIM =====
  bot.on('death', () => {
    console.log('☠️ O‘LDI → qaytish')
    botStatus = '☠️ o‘ldi → home'

    setTimeout(() => bot.chat('/server smp'), 4000)
    setTimeout(() => bot.chat('/team home'), 8000)
  })

  // ===== OCHLIK =====
  bot.on('health', async () => {
    if (bot.food <= 14) {
      const food = bot.inventory.items().find(i =>
        i.name.includes('bread') ||
        i.name.includes('beef') ||
        i.name.includes('pork') ||
        i.name.includes('chicken')
      )

      if (food) {
        try {
          await bot.equip(food, 'hand')
          await bot.consume()
          console.log('🍖 Ovqat yedi')
        } catch {}
      }
    }
  })

  bot.on('kicked', () => reconnect('kick'))
  bot.on('end', () => reconnect('end'))
  bot.on('error', e => console.log('⚠️', e.message))
}

// ===== ANTI AFK =====
function startAntiAfk () {
  clearInterval(antiAfkTimer)

  antiAfkTimer = setInterval(() => {
    const dirs = ['forward', 'left', 'right']
    const d = dirs[Math.floor(Math.random() * dirs.length)]

    bot.setControlState(d, true)
    setTimeout(() => bot.setControlState(d, false), 1200)

    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)

    bot.look(Math.random() * Math.PI * 2, 0, true)
  }, ANTI_AFK_INTERVAL)

  console.log('🟢 Anti‑AFK OK')
}

// ===== RECONNECT =====
function reconnect (why) {
  if (reconnecting) return
  reconnecting = true

  console.log('🔁 reconnect:', why)
  botStatus = '🔁 qayta ulanmoqda'
  clearInterval(antiAfkTimer)
  loggedIn = false

  setTimeout(() => {
    reconnecting = false
    startBot()
  }, RECONNECT_DELAY)
}

// ===== START =====
startBot()