import React, { useRef, useState } from 'react'
import '../App.css'
function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('')
  const formRef = useRef()
  const handleSendClick = (e) => {
    e.preventDefault()
    if (message.trim() !== '') {
      onSendMessage(message)
      setMessage('')
      formRef.current.reset()
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSendClick}>
      <div className="chat__conversation-panel">
        <div className="chat__conversation-panel__container">
          <input
            onChange={(e) => setMessage(e.target.value)}
            className="chat__conversation-panel__input panel-item"
            placeholder="Type a message..."
          />
          <button type="submit" className="chat__conversation-panel__button panel-item btn-icon send-message-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              data-reactid="1036"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      <div className="text-white py-4">
        <div>Quy tắc: Hãy đặt keyword đầu tiên là sumFibonacci thì bot sẽ tính tổng giúp bạn:</div>
        <div className="font-light text-md">Ví dụ: sumFibonacci 15</div>
      </div>
    </form>
  )
}

export default MessageInput
