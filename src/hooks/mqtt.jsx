import { useEffect, useRef } from 'react'
import mqtt from 'mqtt'

export const useMQTT = () => {
  const client = useRef(null)

  const connect = () => {
    client.current = mqtt.connect('wss://test.mosquitto.org:8081/mqtt')
    client.current.on('connect', () => {
      console.log('Connected to MQTT broker')
    })
  }

  const subscribe = (topic, callback) => {
    client.current.subscribe(topic)
    client.current.on('message', (receivedTopic, message) => {
      callback(receivedTopic, JSON.parse(message.toString()))
    })
  }

  const publish = (topic, message) => {
    const payload = JSON.stringify(message)
    client.current.publish(topic, payload)
  }

  const disconnect = () => {
    if (client.current) {
      client.current.end()
    }
  }

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return { connect, subscribe, publish, disconnect }
}
