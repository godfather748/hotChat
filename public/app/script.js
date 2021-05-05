let socket = io()



$('#loginBox').show()
$('#chatpage').hide()



$('#btnStart').click(() => {
    socket.emit('login', {
        username: $('#inpUsername').val(),
        password: $('#inpPassword').val()
    })
})


// let icons = ["CA", "CAshield", "CM", "cyclops", "daredevil", "deadpool", "hulk", "hulkhand", "ironman", "magneto", "spidey", "stormbreaker", "thanos", "thor", "wolverine"]

// function getRandomIcon() {
//     return icons[Math.floor(Math.random() * 15)]
// }

// let iconMap = {}


function onlinePeople(data) {
    $('#onlinePeople').empty()
    $('#onlinePeople').append($(`<li class="contact-link">
                                    <div class="d-flex bd-highlight">
                                        <div class="img_cont">
                                            <!-- class="img_cont" -->
                                            <img src="/icons/everyone.png" class="user_img">
                                            <!-- class="rounded-circle user_img" -->
                                            <!-- <span class="online_icon"></span> -->
                                        </div>
                                        <div class="user_info">
                                            <span>Everyone</span>
                                        </div>
                                    </div>
                                </li>`))
    for (let u of data.users) {
        // console.log(iconMap[u])
        if (u != window.currentUser) {
            // debugger;
            $('#onlinePeople').append($(`
                                            <li class="contact-link ${u}">
                                                <div class="d-flex bd-highlight">
                                                    <div class="img_cont">
                                                        <!-- class="img_cont" -->
                                                        <img src="/icons/${data.iconMap[u]}.png" class="user_img">
                                                        <!-- class="rounded-circle user_img" -->
                                                        <!-- <span class="online_icon"></span> -->
                                                    </div>
                                                    <div class="user_info">
                                                        <span>${u}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        `))
        }
    }
    $('#onlinePeople').append($(`<li class="contact-link leave">
                                    <div class="d-flex bd-highlight">
                                        <div class="img_cont">
                                            <!-- class="img_cont" -->
                                            <img src="/icons/leave.png" class="user_img">
                                            <!-- class="rounded-circle user_img" -->
                                            <!-- <span class="online_icon"></span> -->
                                        </div>
                                        <div class="user_info">
                                            <span>Leave chat</span>
                                        </div>
                                    </div>
                                </li>`))
}

let currentIcon

socket.on('logged-in', (data) => {
    // username = data.username
    $('#loginBox').hide()
    $('#chatpage').show()
    $('#letschat').show()
    $('#chatBox').hide()
    $('#chatBoxFooter').hide()
    $('#crossIcon').hide()
    window.currentUser = data.user
    currentIcon = data.currentIcon
    socket.emit('new-logged-in')
})


socket.on('yes-logged-in', async (data) => {
    await onlinePeople(data)
})

socket.on('login failed', () => {
    window.alert('incorrect username or password')
    console.error('pata nahi kya error hai')
})



$("#onlinePeople").on("click", "li", function (event) {
    if ($(this).hasClass('leave')) {
        $('#loginBox').show()
        $('#chatpage').hide()
        $('#inpUsername').val('')
        $('#inpPassword').val('')
        socket.emit('userLeft', currentUser)
    } else {
        $('#onlinePeople .active').removeClass('active')
        $(this).addClass('active')
        $('#letschat').hide()
        $('#chatBox').show()
        $('#chatBoxFooter').show()
        $('#uploadId').hide()
    }
});

// $('#onlinePeople #leave').click(()=>{
//     $('#loginBox').show()
//     $('#chatpage').hide()
//     socket.emit('userLeft',currentUser)
// })



$('#btnSend').click(() => {
    socket.emit('msg_send', {
        from: currentUser,
        to: $('#onlinePeople .active .user_info span').text(),
        message: $('#inpMessage').val()
    })
    $('#chatBox').append($(`<div class="d-flex justify-content-end mb-4">
                                    <div class="msg_cotainer_send">
                                        ${$('#inpMessage').val()}
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="/icons/${currentIcon}.png" class="rounded-circle user_img_msg">
                                    </div>
                                </div>`))
    $('#inpMessage').val('')
})


socket.on('msg_rcvd', (data) => {
    $('#chatBox').append($(`<div class="d-flex justify-content-start mb-4">
                                    <div class="img_cont_msg">
                                        <img src="/icons/${data.icon}.png"
                                            class="rounded-circle user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        ${data.message}
                                    </div>
                                </div>`))
})


$('#searchIcon').click(() => {
    if ($('#searchId').val()) {
        $('#searchIcon').hide()
        $('#crossIcon').show()
        $('#onlinePeople li').hide()
        $(`#onlinePeople .${$('#searchId').val()}`).show()
    } else {
        $('#onlinePeople li').show()
    }
})

$('#crossIcon').click(() => {
    $('#searchId').val('')
    $('#onlinePeople li').show()
    $('#searchIcon').show()
    $('#crossIcon').hide()
})


$('#attachBtn').click(() => {
    $('.action_menu').toggle()
})


socket.on('checkIfOnline',()=>{
    console.log('hii')
    socket.emit('replyToCheck',{
        id: socket.id,
        user: currentUser
    })
})
