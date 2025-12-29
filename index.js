const mineflayer = require('mineflayer')
const express = require('express')

// ===== WEB (Render / Uptime) =====
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
const USERNAME = 'abuuuu'
const VERSION = '1.21'
const PASSWORD = '252356n1'

const ADMIN = 'itzRellixsMF'
const TARGET_SERVER = 'smp'

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

    setTimeout(() => bot.chat(`/login ${PASSWORD}`), 2000)
    setTimeout(() => bot.chat(`/server ${TARGET_SERVER}`), 6000)
    setTimeout(() => bot.chat('/home'), 10000)

    startAntiAfk()
  })

  // ===== CHAT =====
  bot.on('message', msg => {
    const text = msg.toString()
    console.log('💬', text)

    if (!loggedIn && /login|\/l/i.test(text)) {
      bot.chat(`/login ${PASSWORD}`)
      loggedIn = true
    }

    const pm = text.match(/\[([^\]]+)\s→\sme\]\s(.+)/i)
    if (pm) {
      const sender = pm[1]
      const message = pm[2]

      if (sender === ADMIN) {
        console.log('📩 ADMIN PM:', message)
      } else {
        bot.chat(`${sender}: ${message}`)
      }
    }
  })

  // ===== GUI AUTO CLICK (HOME + TPA CONFIRM) =====
  bot.on('windowOpen', async (window) => {
    try {
      const title = window.title?.toString() || ''
      console.log('🪟 GUI:', title)

      // HOME / BED GUI → 1-kravat
      if (/home|uy|bed|spawn/i.test(title)) {
        console.log('🛏️ 1-kravat tanlanmoqda')
        await bot.clickWindow(0, 0, 0)
        botStatus = '🟢 AFK (uyda)'
      }

      // TPA CONFIRM GUI → YES (yashil)
      if (/confirm|request/i.test(title)) {
        console.log('✅ TPA CONFIRM → YES')

        // odatda YES oxirgi slotlarda bo‘ladi (8 yoki 26)
        const yesSlot =
          window.slots.findIndex(i =>
            i && (i.name.includes('lime') || i.name.includes('green'))
          )

        if (yesSlot !== -1) {
          await bot.clickWindow(yesSlot, 0, 0)
          console.log('🤝 TPA qabul qilindi')
        }
      }
    } catch (e) {
      console.log('❌ GUI xato:', e.message)
    }
  })

  // ===== O‘LIM =====
  bot.on('death', () => {
    console.log('☠️ O‘LDI → qaytish')
    botStatus = '☠️ o‘ldi → uy'

    setTimeout(() => bot.chat(`/server ${TARGET_SERVER}`), 4000)
    setTimeout(() => bot.chat('/team home'), 9000)
  })

  // ===== OCHLIK =====
  bot.on('health', async () => {
    if (bot.food <= 14) {
      const food = bot.inventory.items().find(i =>
        ['bread', 'beef', 'pork', 'chicken'].some(f => i.name.includes(f))
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

  console.log('🟢 Anti-AFK OK')
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
