const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 4563

app.use('/', express.static(path.join(__dirname, '/public')))


let usersPass = {}
let users = []
let socketMap = {}

let icons = ["CA", "CAshield", "CM", "cyclops", "daredevil", "deadpool", "hulk", "hulkhand", "ironman", "magneto", "spidey", "stormbreaker", "thanos", "thor", "wolverine"]

function getRandomIcon() {
    return icons[Math.floor(Math.random() * 15)]
}

let iconMap = {}

io.on('connection', (socket) => {

    function login(s, u) {
        s.join(u)
        socketMap[u] = s.id
        iconMap[u] = getRandomIcon()
        s.emit('logged-in', {
            user: u,
            currentIcon: iconMap[u]
        })
    }

    socket.on('login', (data) => {
        if (usersPass[data.username]) {
            if (usersPass[data.username] == data.password) {
                login(socket, data.username)
            } else {
                socket.emit('login failed')
            }
        } else {
            usersPass[data.username] = data.password
            users.push(data.username)
            login(socket, data.username)
        }
    })

    socket.on('new-logged-in', () => {
        io.emit('yes-logged-in', {
            users,
            iconMap
        })
    })

    setInterval(() => {
        users = []
        socketMap = {}
        io.emit('checkIfOnline')
    }, 300000);

    socket.on('replyToCheck', (data) => {
        users.push(data.user)
        socketMap[data.user] = data.id
        io.emit('yes-logged-in', {
            users,
            iconMap
        })
    })

    socket.on('msg_send', (data) => {
        data.icon = iconMap[data.from]
        if (data.to != 'Everyone') {
            io.to(data.to).emit('msg_rcvd', data)
        } else {
            socket.broadcast.emit('msg_rcvd', data)
        }
    })

    socket.on('userLeft', (data) => {
        delete usersPass[data]
        delete iconMap[data]
        const index = users.indexOf(data);
        delete socketMap[data]
        users.splice(index, 1);
        io.emit('yes-logged-in', {
            users,
            iconMap
        })

    })
})



server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
