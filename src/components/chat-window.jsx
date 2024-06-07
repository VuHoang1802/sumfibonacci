import React, { useEffect, useRef } from 'react'

function ChatWindow({ messages }) {
  const chatRef = useRef(null)
  let infoUserId = {
    userId: '',
    avatar: '',
  }
  useEffect(() => {
    infoUserId = JSON.parse(localStorage.getItem('user'))

    console.log(infoUserId.userId)
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="chat-window" ref={chatRef}>
      {/* {messages.map((message, index) => (
        <div key={index} className="message">
          <span className="sender">{message.sender}: </span>
          <span className="text">{message.text}</span>
        </div>
      ))} */}

      <div className="chat__conversation-board">
        {messages?.map((item, index) => (
          <div
            key={index}
            className={`chat__conversation-board__message-container ${item.sender === 'Bot' ? '' : 'reversed'}`}
          >
            <div className="chat__conversation-board__message__person">
              <div className="chat__conversation-board__message__person__avatar">
                <img
                  src={
                    item.sender === 'Bot'
                      ? 'https://randomuser.me/api/portraits/men/9.jpg'
                      : JSON.parse(localStorage.getItem('user')).avatar
                  }
                  alt="Dennis Mikle"
                />
              </div>
              <span className="chat__conversation-board__message__person__nickname">{item.sender}</span>
            </div>
            <div className="chat__conversation-board__message__context">
              <div className="chat__conversation-board__message__bubble">
                <span className="block text-white">
                  <span className=" text-[14px]">{item.text}</span>
                  {item.sender !== 'Bot' && (
                    <span className="block italic text-[10px]">{JSON.parse(localStorage.getItem('user')).userId}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ChatWindow
