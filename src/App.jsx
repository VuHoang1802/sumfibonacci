import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { v4 as uuidv4 } from 'uuid'
import mqtt from 'mqtt'
import ChatWindow from './components/chat-window'
import MessageInput from './components/messageform'

const brokerUrl = 'wss://test.mosquitto.org:8081'

const App = () => {
  const [messages, setMessages] = useState([])
  const [client, setClient] = useState(null)
  const [userId] = useState(uuidv4())
  const [users, setUsers] = useState([])
  const [allParticipants, setAllParticipants] = useState([])
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    const storedMessages = localStorage.getItem('messages')
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }

    const mqttClient = mqtt.connect(brokerUrl)

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker')
    })

    mqttClient.on('message', (topic, message) => {
      try {
        const messageData = JSON.parse(message.toString())

        if (messageData.type === 'message') {
          const newMessage = { sender: messageData.sender, text: messageData.text }
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage]
            localStorage.setItem('messages', JSON.stringify(updatedMessages))
            return updatedMessages
          })
        } else if (messageData.type === 'join') {
          setAllParticipants((prevParticipants) => [...prevParticipants, messageData.userId])
          const joinMessage = { sender: 'System', text: `User ${messageData.userId} has joined the chat` }
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, joinMessage]
            localStorage.setItem('messages', JSON.stringify(updatedMessages))
            return updatedMessages
          })
        } else if (messageData.type === 'leave') {
          setAllParticipants((prevParticipants) => prevParticipants.filter((id) => id !== messageData.userId))
          const leaveMessage = { sender: 'System', text: `User ${messageData.userId} has left the chat` }
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, leaveMessage]
            localStorage.setItem('messages', JSON.stringify(updatedMessages))
            return updatedMessages
          })
        }
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    })

    mqttClient.on('error', (err) => {
      console.error('MQTT error:', err)
    })

    mqttClient.on('close', () => {
      console.log('MQTT connection closed')
    })

    setClient(mqttClient)

    return () => {
      if (mqttClient) {
        mqttClient.publish('chat', JSON.stringify({ type: 'leave', userId }))
        mqttClient.end()
      }
    }
  }, [userId])

  const joinChat = () => {
    if (client) {
      client.subscribe('chat', (err) => {
        if (!err) {
          console.log('Subscribed to topic "chat"')
          client.publish('chat', JSON.stringify({ type: 'join', userId }))

          localStorage.setItem(
            'user',
            JSON.stringify({
              userId: userId,
              avatar: `https://source.unsplash.com/random/200x200?sig=${userId}`,
            }),
          )
          setHasJoined(true)
        } else {
          console.error('Error subscribing to topic "chat":', err)
        }
      })
    }

    // if (client) {
    //   client.subscribe('chat', (err) => {
    //     if (!err) {
    //       console.log('Subscribed to topic "chat"')
    //       client.publish('chat', JSON.stringify({ type: 'join', userId }))
    //       setHasJoined(true)

    //       // Thêm ID người dùng mới vào danh sách
    //       setAllParticipants((prevParticipants) => {
    //         const updatedParticipants = [...prevParticipants, userId]
    //         localStorage.setItem('userIds', JSON.stringify(updatedParticipants))
    //         return updatedParticipants
    //       })
    //     } else {
    //       console.error('Error subscribing to topic "chat":', err)
    //     }
    //   })
    // }
  }

  const sendMessage = (messageText) => {
    if (client) {
      let response
      if (messageText.startsWith('sumFibonacci')) {
        const num = parseInt(messageText.split(' ')[1], 10)
        if (!isNaN(num)) {
          const fibonacciSum = calculateFibonacciSum(num)
          response = `Sum of Fibonacci numbers up to ${num} is: ${fibonacciSum}`
        } else {
          response = 'Invalid input. Please enter a valid number.'
        }
      } else {
        response = 'Invalid message format. Please use "sumFibonacci <number>" format.'
      }

      const messageData = { type: 'message', sender: `User ${userId}`, text: messageText }
      const responseMessage = { type: 'message', sender: 'Bot', text: response }

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, messageData, responseMessage]
        localStorage.setItem('messages', JSON.stringify(updatedMessages))
        return updatedMessages
      })

      client.publish('chat', JSON.stringify(messageData))
      client.publish('chat', JSON.stringify(responseMessage))
    }
  }

  const calculateFibonacciSum = (num) => {
    let sum = 0
    let prev = 0
    let curr = 1

    for (let i = 0; i <= num; i++) {
      sum += prev
      const temp = curr
      curr = prev + curr
      prev = temp
    }

    return sum
  }

  const LeaveButton = ({ onLeaveChat }) => {
    return (
      <button className="leave-button text-white px-4 py-2 bg-slate-700 rounded-md" onClick={onLeaveChat}>
        Leave Chat
      </button>
    )
  }

  const leaveChat = () => {
    if (client) {
      client.publish('chat', JSON.stringify({ type: 'leave', userId }))
      setHasJoined(false)
      setMessages([])
    }
  }

  // useEffect(() => {
  //   const storedUserIds = localStorage.getItem('userId')
  //   if (storedUserIds) {
  //     setAllParticipants(JSON.parse(storedUserIds))
  //   }
  // }, [])

  // const [userAvatars] = useState({
  //   [userId]: { avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  // })

  return (
    <div className="--dark-theme" id="chat">
      <div className="flex items-center justify-between">
        <h1 className="my-3 text-xl font-bold text-[red]">Tính tổng dãy Fibonacci</h1>
        {hasJoined === true && <LeaveButton onLeaveChat={leaveChat} />}
      </div>

      {hasJoined ? (
        <>
          <ChatWindow messages={messages} />
          <MessageInput onSendMessage={sendMessage} />
        </>
      ) : (
        <button className="text-white px-4 py-2 bg-slate-700 rounded-md" onClick={joinChat}>
          Tham gia
        </button>
      )}
    </div>
  )
}

export default App
